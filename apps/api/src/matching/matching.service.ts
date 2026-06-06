import { Injectable } from '@nestjs/common';
import { JobOfferStatus, JobStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { estimateEtaMinutes, haversineKm } from '../common/geo';

const OFFER_TIMEOUT_MS = 60_000;

@Injectable()
export class MatchingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  async startMatching(jobId: string) {
    const job = await this.prisma.job.findUniqueOrThrow({
      where: { id: jobId },
      include: { address: true, serviceType: true },
    });

    await this.prisma.job.update({
      where: { id: jobId },
      data: { status: JobStatus.MATCHING },
    });

    const cleaners = await this.prisma.cleanerProfile.findMany({
      where: {
        verificationStatus: 'APPROVED',
        isOnline: true,
        lastLat: { not: null },
        lastLng: { not: null },
      },
      include: { user: true },
    });

    const ranked = cleaners
      .map((profile) => {
        const distanceKm = haversineKm(
          job.address.lat,
          job.address.lng,
          profile.lastLat!,
          profile.lastLng!,
        );
        return { profile, distanceKm };
      })
      .filter(({ profile, distanceKm }) => distanceKm <= profile.serviceRadiusKm)
      .sort((a, b) => {
        if (job.preferredCleanerId) {
          if (a.profile.userId === job.preferredCleanerId) return -1;
          if (b.profile.userId === job.preferredCleanerId) return 1;
        }
        return a.distanceKm - b.distanceKm;
      })
      .slice(0, 5);

    if (!ranked.length) {
      return { jobId, offers: [], message: 'No cleaners available' };
    }

    const expiresAt = new Date(Date.now() + OFFER_TIMEOUT_MS);
    const offers = await Promise.all(
      ranked.map(({ profile, distanceKm }) =>
        this.prisma.jobOffer.create({
          data: {
            jobId,
            cleanerId: profile.userId,
            expiresAt,
          },
        }).then(async (offer) => {
          await this.notifications.notify(
            profile.userId,
            'PUSH',
            'JOB_OFFER',
            'New cleaning job',
            `${job.serviceType.name} — ${distanceKm.toFixed(1)} km away`,
            { jobId, offerId: offer.id },
          );
          return { ...offer, distanceKm, etaMinutes: estimateEtaMinutes(distanceKm) };
        }),
      ),
    );

    return { jobId, offers };
  }

  async acceptOffer(offerId: string, cleanerId: string) {
    const offer = await this.prisma.jobOffer.findUniqueOrThrow({
      where: { id: offerId },
      include: { job: { include: { address: true } } },
    });

    if (offer.cleanerId !== cleanerId) {
      throw new Error('Not your offer');
    }
    if (offer.status !== JobOfferStatus.PENDING || offer.expiresAt < new Date()) {
      throw new Error('Offer no longer valid');
    }

    const cleaner = await this.prisma.cleanerProfile.findUniqueOrThrow({
      where: { userId: cleanerId },
    });

    const distanceKm = haversineKm(
      offer.job.address.lat,
      offer.job.address.lng,
      cleaner.lastLat ?? offer.job.address.lat,
      cleaner.lastLng ?? offer.job.address.lng,
    );
    const etaMinutes = estimateEtaMinutes(distanceKm);

    const [job] = await this.prisma.$transaction([
      this.prisma.job.update({
        where: { id: offer.jobId },
        data: {
          status: JobStatus.ASSIGNED,
          cleanerId,
          etaMinutes,
        },
      }),
      this.prisma.jobOffer.update({
        where: { id: offerId },
        data: { status: JobOfferStatus.ACCEPTED, respondedAt: new Date() },
      }),
      this.prisma.jobOffer.updateMany({
        where: {
          jobId: offer.jobId,
          id: { not: offerId },
          status: JobOfferStatus.PENDING,
        },
        data: { status: JobOfferStatus.EXPIRED },
      }),
    ]);

    await this.notifications.notifyJobMatched(offer.job.customerId, cleanerId, job.id);
    return job;
  }
}
