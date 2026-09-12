import { randomUUID } from 'crypto';

export type PlanTier = 'free' | 'starter' | 'pro' | 'enterprise';
export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'disputed';
export type DealStatus = 'proposed' | 'negotiating' | 'accepted' | 'in_progress' | 'completed' | 'rejected' | 'expired';
export type DonationType = 'one_time' | 'monthly' | 'tip' | 'super_chat';

export interface SubscriptionPlan {
  id: string;
  name: string;
  tier: PlanTier;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  features: string[];
  limits: {
    videos: number;
    storage: number;
    aiRequests: number;
    teamMembers: number;
    channels: number;
    analyticsRetention: number;
    exportFormats: string[];
    supportLevel: 'community' | 'email' | 'priority' | 'dedicated';
  };
  stripePriceId: string;
  trialDays: number;
  isActive: boolean;
  createdAt: string;
}

export interface UserSubscription {
  id: string;
  userId: string;
  planId: string;
  status: 'active' | 'canceled' | 'past_due' | 'trialing' | 'paused';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  trialEnd: string | null;
  paymentMethodId: string | null;
  stripeSubscriptionId: string | null;
  usage: SubscriptionUsage;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionUsage {
  videosCreated: number;
  storageUsed: number;
  aiRequestsUsed: number;
  teamMembersAdded: number;
  channelsCreated: number;
  currentPeriodStart: string;
}

export interface Donation {
  id: string;
  donorId: string;
  recipientId: string;
  recipientChannelId: string;
  amount: number;
  currency: string;
  type: DonationType;
  message: string | null;
  isAnonymous: boolean;
  status: PaymentStatus;
  paymentId: string | null;
  stripePaymentIntentId: string | null;
  taxDeductible: boolean;
  receiptUrl: string | null;
  createdAt: string;
  refundedAt: string | null;
}

export interface BrandDeal {
  id: string;
  brandId: string;
  brandName: string;
  creatorId: string;
  creatorChannelId: string;
  title: string;
  description: string;
  type: 'sponsored_video' | 'product_placement' | 'dedicated' | 'integration' | 'shoutout' | 'brand_ambassador';
  status: DealStatus;
  budget: {
    total: number;
    currency: string;
    perVideo?: number;
    bonus?: { views?: number; engagement?: number; amount?: number };
  };
  requirements: BrandDealRequirements;
  deliverables: BrandDealDeliverable[];
  timeline: {
    proposalDate: string;
    negotiationStart: string | null;
    acceptedDate: string | null;
    contentDeadline: string | null;
    publishDate: string | null;
    campaignEnd: string | null;
  };
  contracts: BrandDealContract[];
  performance: BrandDealPerformance | null;
  communication: BrandDealMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface BrandDealRequirements {
  minViews: number;
  minEngagement: number;
  contentStyle: string[];
  mandatoryMentions: string[];
  prohibitedContent: string[];
  disclosureRequired: boolean;
  exclusivityDays: number;
  revisionLimit: number;
  approvalRequired: boolean;
}

export interface BrandDealDeliverable {
  id: string;
  type: string;
  description: string;
  dueDate: string;
  status: 'pending' | 'in_progress' | 'submitted' | 'approved' | 'revision_needed';
  submittedAt: string | null;
  approvedAt: string | null;
  url: string | null;
  notes: string;
}

export interface BrandDealContract {
  id: string;
  version: number;
  terms: string;
  signedByBrand: boolean;
  signedByCreator: boolean;
  signedAt: string | null;
  pdfUrl: string | null;
}

export interface BrandDealPerformance {
  views: number;
  likes: number;
  comments: number;
  shares: number;
  clickThroughRate: number;
  engagementRate: number;
  estimatedRevenue: number;
  actualPayout: number;
  bonusEarned: number;
  reportUrl: string | null;
}

export interface BrandDealMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderType: 'brand' | 'creator' | 'system';
  content: string;
  attachments: string[];
  readBy: string[];
  createdAt: string;
}

export interface MerchProduct {
  id: string;
  creatorId: string;
  channelId: string;
  name: string;
  description: string;
  category: 'apparel' | 'accessories' | 'digital' | 'collectible' | 'custom';
  price: number;
  currency: string;
  compareAtPrice: number | null;
  sku: string;
  inventory: number;
  images: string[];
  variants: MerchVariant[];
  isActive: boolean;
  isFeatured: boolean;
  salesCount: number;
  revenue: number;
  createdAt: string;
  updatedAt: string;
}

export interface MerchVariant {
  id: string;
  name: string;
  options: Record<string, string>;
  price: number;
  inventory: number;
  sku: string;
}

export interface MerchOrder {
  id: string;
  buyerId: string;
  creatorId: string;
  items: Array<{
    productId: string;
    variantId: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  currency: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  shippingAddress: ShippingAddress;
  trackingNumber: string | null;
  paymentId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ShippingAddress {
  name: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface RevenueReport {
  channelId: string;
  period: { start: string; end: string };
  total: number;
  breakdown: {
    adRevenue: number;
    membershipRevenue: number;
    donationRevenue: number;
    sponsorshipRevenue: number;
    merchandiseRevenue: number;
    otherRevenue: number;
  };
  transactions: RevenueTransaction[];
  projections: RevenueProjection[];
  comparison: {
    previousPeriod: number;
    changePercent: number;
    yearOverYear: number;
  };
}

export interface RevenueTransaction {
  id: string;
  type: string;
  amount: number;
  currency: string;
  description: string;
  status: PaymentStatus;
  createdAt: string;
}

export interface RevenueProjection {
  month: string;
  projected: number;
  confidence: number;
  factors: string[];
}

export interface PayoutSchedule {
  id: string;
  channelId: string;
  frequency: 'weekly' | 'biweekly' | 'monthly';
  minimumAmount: number;
  currency: string;
  nextPayoutDate: string;
  lastPayoutDate: string | null;
  autoPayout: boolean;
  bankAccountId: string | null;
  status: 'active' | 'paused' | 'pending_setup';
}

export interface TaxDocument {
  id: string;
  userId: string;
  type: 'w9' | 'w8ben' | 'invoice' | '1099';
  year: number;
  url: string | null;
  status: 'pending' | 'submitted' | 'verified' | 'rejected';
  submittedAt: string | null;
}

function generateId(): string {
  return `mon_${Date.now()}_${randomUUID().slice(0, 8)}`;
}

const DEFAULT_PLANS: SubscriptionPlan[] = [
  {
    id: 'plan_free',
    name: 'Free',
    tier: 'free',
    price: 0,
    currency: 'USD',
    interval: 'month',
    features: ['3 videos/month', '1GB storage', '100 AI requests', 'Basic analytics'],
    limits: {
      videos: 3,
      storage: 1073741824,
      aiRequests: 100,
      teamMembers: 1,
      channels: 1,
      analyticsRetention: 30,
      exportFormats: ['mp4'],
      supportLevel: 'community',
    },
    stripePriceId: '',
    trialDays: 0,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'plan_starter',
    name: 'Starter',
    tier: 'starter',
    price: 9.99,
    currency: 'USD',
    interval: 'month',
    features: ['20 videos/month', '10GB storage', '500 AI requests', 'Advanced analytics', 'Priority support'],
    limits: {
      videos: 20,
      storage: 10737418240,
      aiRequests: 500,
      teamMembers: 3,
      channels: 3,
      analyticsRetention: 90,
      exportFormats: ['mp4', 'webm', 'mov'],
      supportLevel: 'email',
    },
    stripePriceId: process.env.STRIPE_STARTER_PRICE_ID || '',
    trialDays: 7,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'plan_pro',
    name: 'Pro',
    tier: 'pro',
    price: 29.99,
    currency: 'USD',
    interval: 'month',
    features: ['Unlimited videos', '100GB storage', '5000 AI requests', 'Full analytics', 'Custom branding', 'Team collaboration'],
    limits: {
      videos: Infinity,
      storage: 107374182400,
      aiRequests: 5000,
      teamMembers: 10,
      channels: 10,
      analyticsRetention: 365,
      exportFormats: ['mp4', 'webm', 'mov', 'avi', 'mkv', 'gif'],
      supportLevel: 'priority',
    },
    stripePriceId: process.env.STRIPE_PRO_PRICE_ID || '',
    trialDays: 14,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'plan_enterprise',
    name: 'Enterprise',
    tier: 'enterprise',
    price: 99.99,
    currency: 'USD',
    interval: 'month',
    features: ['Unlimited everything', '1TB storage', 'Unlimited AI', 'White-label', 'SSO', 'Dedicated manager'],
    limits: {
      videos: Infinity,
      storage: 1099511627776,
      aiRequests: Infinity,
      teamMembers: Infinity,
      channels: Infinity,
      analyticsRetention: Infinity,
      exportFormats: ['mp4', 'webm', 'mov', 'avi', 'mkv', 'gif', 'prores'],
      supportLevel: 'dedicated',
    },
    stripePriceId: process.env.STRIPE_ENTERPRISE_PRICE_ID || '',
    trialDays: 30,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
];

const plans = new Map<string, SubscriptionPlan>();
const userSubscriptions = new Map<string, UserSubscription>();
const donations = new Map<string, Donation>();
const brandDeals = new Map<string, BrandDeal>();
const merchProducts = new Map<string, MerchProduct>();
const merchOrders = new Map<string, MerchOrder>();
const payoutSchedules = new Map<string, PayoutSchedule>();
const taxDocuments = new Map<string, TaxDocument[]>();

for (const plan of DEFAULT_PLANS) {
  plans.set(plan.id, plan);
}

export const monetizationService = {
  getPlans(): SubscriptionPlan[] {
    return Array.from(plans.values()).filter((p) => p.isActive);
  },

  getPlan(planId: string): SubscriptionPlan | null {
    return plans.get(planId) ?? null;
  },

  getPlanByTier(tier: PlanTier): SubscriptionPlan | null {
    return Array.from(plans.values()).find((p) => p.tier === tier) ?? null;
  },

  async createSubscription(
    userId: string,
    planId: string,
    paymentMethodId?: string,
  ): Promise<UserSubscription> {
    const plan = plans.get(planId);
    if (!plan) throw new Error('Plan not found');

    const existing = Array.from(userSubscriptions.values()).find(
      (s) => s.userId === userId && s.status === 'active',
    );
    if (existing) throw new Error('User already has an active subscription');

    const now = new Date();
    const periodEnd = new Date(now);
    if (plan.interval === 'month') periodEnd.setMonth(periodEnd.getMonth() + 1);
    else periodEnd.setFullYear(periodEnd.getFullYear() + 1);

    const subscription: UserSubscription = {
      id: generateId(),
      userId,
      planId,
      status: plan.tier === 'free' ? 'active' : 'trialing',
      currentPeriodStart: now.toISOString(),
      currentPeriodEnd: periodEnd.toISOString(),
      cancelAtPeriodEnd: false,
      trialEnd: plan.trialDays > 0 ? addDays(now, plan.trialDays).toISOString() : null,
      paymentMethodId: paymentMethodId ?? null,
      stripeSubscriptionId: null,
      usage: {
        videosCreated: 0,
        storageUsed: 0,
        aiRequestsUsed: 0,
        teamMembersAdded: 1,
        channelsCreated: 0,
        currentPeriodStart: now.toISOString(),
      },
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    userSubscriptions.set(subscription.id, subscription);
    return subscription;
  },

  async getSubscription(userId: string): Promise<UserSubscription | null> {
    return Array.from(userSubscriptions.values()).find(
      (s) => s.userId === userId && (s.status === 'active' || s.status === 'trialing'),
    ) ?? null;
  },

  async cancelSubscription(subscriptionId: string): Promise<UserSubscription | null> {
    const sub = userSubscriptions.get(subscriptionId);
    if (!sub) return null;
    sub.cancelAtPeriodEnd = true;
    sub.updatedAt = new Date().toISOString();
    return sub;
  },

  async reactivateSubscription(subscriptionId: string): Promise<UserSubscription | null> {
    const sub = userSubscriptions.get(subscriptionId);
    if (!sub) return null;
    sub.cancelAtPeriodEnd = false;
    sub.updatedAt = new Date().toISOString();
    return sub;
  },

  async changePlan(subscriptionId: string, newPlanId: string): Promise<UserSubscription | null> {
    const sub = userSubscriptions.get(subscriptionId);
    if (!sub) return null;
    const newPlan = plans.get(newPlanId);
    if (!newPlan) return null;
    sub.planId = newPlanId;
    sub.updatedAt = new Date().toISOString();
    return sub;
  },

  async checkUsageLimits(userId: string): Promise<{
    canCreateVideo: boolean;
    canUseAI: boolean;
    canAddTeamMember: boolean;
    limits: SubscriptionPlan['limits'];
    usage: SubscriptionUsage;
  } | null> {
    const sub = await this.getSubscription(userId);
    if (!sub) return null;
    const plan = plans.get(sub.planId);
    if (!plan) return null;

    return {
      canCreateVideo: sub.usage.videosCreated < plan.limits.videos,
      canUseAI: sub.usage.aiRequestsUsed < plan.limits.aiRequests,
      canAddTeamMember: sub.usage.teamMembersAdded < plan.limits.teamMembers,
      limits: plan.limits,
      usage: sub.usage,
    };
  },

  async recordUsage(userId: string, type: keyof SubscriptionUsage, amount: number = 1): Promise<boolean> {
    const sub = await this.getSubscription(userId);
    if (!sub) return false;

    switch (type) {
      case 'videosCreated':
        sub.usage.videosCreated += amount;
        break;
      case 'storageUsed':
        sub.usage.storageUsed += amount;
        break;
      case 'aiRequestsUsed':
        sub.usage.aiRequestsUsed += amount;
        break;
      case 'teamMembersAdded':
        sub.usage.teamMembersAdded += amount;
        break;
      case 'channelsCreated':
        sub.usage.channelsCreated += amount;
        break;
    }
    sub.updatedAt = new Date().toISOString();
    return true;
  },

  async createDonation(
    donorId: string,
    recipientId: string,
    recipientChannelId: string,
    amount: number,
    options?: { type?: DonationType; message?: string; isAnonymous?: boolean; currency?: string },
  ): Promise<Donation> {
    if (amount <= 0) throw new Error('Donation amount must be positive');
    if (amount > 10000) throw new Error('Maximum donation amount is $10,000');

    const donation: Donation = {
      id: generateId(),
      donorId,
      recipientId,
      recipientChannelId,
      amount,
      currency: options?.currency ?? 'USD',
      type: options?.type ?? 'one_time',
      message: options?.message ?? null,
      isAnonymous: options?.isAnonymous ?? false,
      status: 'completed',
      paymentId: generateId(),
      stripePaymentIntentId: `pi_${randomUUID().slice(0, 24)}`,
      taxDeductible: false,
      receiptUrl: `/api/monetization/receipts/${generateId()}.pdf`,
      createdAt: new Date().toISOString(),
      refundedAt: null,
    };

    donations.set(donation.id, donation);
    return donation;
  },

  async getDonations(
    options: { recipientChannelId?: string; donorId?: string; limit?: number; offset?: number },
  ): Promise<Donation[]> {
    let results = Array.from(donations.values());
    if (options.recipientChannelId) {
      results = results.filter((d) => d.recipientChannelId === options.recipientChannelId);
    }
    if (options.donorId) {
      results = results.filter((d) => d.donorId === options.donorId);
    }
    results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return results.slice(options.offset ?? 0, (options.offset ?? 0) + (options.limit ?? 50));
  },

  async getDonationStats(channelId: string): Promise<{
    totalReceived: number;
    totalDonations: number;
    averageDonation: number;
    topDonors: Array<{ donorId: string; total: number; count: number }>;
    recentDonations: Donation[];
  }> {
    const channelDonations = Array.from(donations.values()).filter(
      (d) => d.recipientChannelId === channelId && d.status === 'completed',
    );

    const donorMap = new Map<string, { total: number; count: number }>();
    for (const d of channelDonations) {
      if (d.isAnonymous) continue;
      const existing = donorMap.get(d.donorId) ?? { total: 0, count: 0 };
      donorMap.set(d.donorId, { total: existing.total + d.amount, count: existing.count + 1 });
    }

    const topDonors = Array.from(donorMap.entries())
      .map(([donorId, stats]) => ({ donorId, ...stats }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);

    return {
      totalReceived: channelDonations.reduce((acc, d) => acc + d.amount, 0),
      totalDonations: channelDonations.length,
      averageDonation: channelDonations.length > 0
        ? channelDonations.reduce((acc, d) => acc + d.amount, 0) / channelDonations.length
        : 0,
      topDonors,
      recentDonations: channelDonations.slice(0, 10),
    };
  },

  async refundDonation(donationId: string): Promise<Donation | null> {
    const donation = donations.get(donationId);
    if (!donation) return null;
    if (donation.status !== 'completed') return null;
    donation.status = 'refunded';
    donation.refundedAt = new Date().toISOString();
    return donation;
  },

  async createBrandDeal(
    brandId: string,
    brandName: string,
    creatorId: string,
    creatorChannelId: string,
    data: {
      title: string;
      description: string;
      type: BrandDeal['type'];
      budget: BrandDeal['budget'];
      requirements: Partial<BrandDealRequirements>;
    },
  ): Promise<BrandDeal> {
    const deal: BrandDeal = {
      id: generateId(),
      brandId,
      brandName,
      creatorId,
      creatorChannelId,
      title: data.title,
      description: data.description,
      type: data.type,
      status: 'proposed',
      budget: data.budget,
      requirements: {
        minViews: data.requirements.minViews ?? 0,
        minEngagement: data.requirements.minEngagement ?? 0,
        contentStyle: data.requirements.contentStyle ?? [],
        mandatoryMentions: data.requirements.mandatoryMentions ?? [],
        prohibitedContent: data.requirements.prohibitedContent ?? [],
        disclosureRequired: data.requirements.disclosureRequired ?? true,
        exclusivityDays: data.requirements.exclusivityDays ?? 0,
        revisionLimit: data.requirements.revisionLimit ?? 3,
        approvalRequired: data.requirements.approvalRequired ?? true,
      },
      deliverables: [],
      timeline: {
        proposalDate: new Date().toISOString(),
        negotiationStart: null,
        acceptedDate: null,
        contentDeadline: null,
        publishDate: null,
        campaignEnd: null,
      },
      contracts: [],
      performance: null,
      communication: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    brandDeals.set(deal.id, deal);
    return deal;
  },

  async updateBrandDealStatus(
    dealId: string,
    status: BrandDeal['status'],
  ): Promise<BrandDeal | null> {
    const deal = brandDeals.get(dealId);
    if (!deal) return null;
    deal.status = status;
    deal.updatedAt = new Date().toISOString();
    if (status === 'accepted') deal.timeline.acceptedDate = new Date().toISOString();
    if (status === 'in_progress') deal.timeline.negotiationStart = new Date().toISOString();
    return deal;
  },

  async addBrandDealDeliverable(
    dealId: string,
    deliverable: Omit<BrandDealDeliverable, 'id' | 'status' | 'submittedAt' | 'approvedAt' | 'notes'>,
  ): Promise<BrandDeal | null> {
    const deal = brandDeals.get(dealId);
    if (!deal) return null;
    deal.deliverables.push({
      ...deliverable,
      id: generateId(),
      status: 'pending',
      submittedAt: null,
      approvedAt: null,
      notes: '',
    });
    deal.updatedAt = new Date().toISOString();
    return deal;
  },

  async submitDeliverable(
    dealId: string,
    deliverableId: string,
    url: string,
  ): Promise<BrandDealDeliverable | null> {
    const deal = brandDeals.get(dealId);
    if (!deal) return null;
    const deliverable = deal.deliverables.find((d) => d.id === deliverableId);
    if (!deliverable) return null;
    deliverable.status = 'submitted';
    deliverable.submittedAt = new Date().toISOString();
    deliverable.url = url;
    deal.updatedAt = new Date().toISOString();
    return deliverable;
  },

  async approveDeliverable(
    dealId: string,
    deliverableId: string,
  ): Promise<BrandDealDeliverable | null> {
    const deal = brandDeals.get(dealId);
    if (!deal) return null;
    const deliverable = deal.deliverables.find((d) => d.id === deliverableId);
    if (!deliverable) return null;
    deliverable.status = 'approved';
    deliverable.approvedAt = new Date().toISOString();
    deal.updatedAt = new Date().toISOString();
    return deliverable;
  },

  async addBrandDealMessage(
    dealId: string,
    senderId: string,
    senderName: string,
    senderType: BrandDealMessage['senderType'],
    content: string,
    attachments?: string[],
  ): Promise<BrandDealMessage | null> {
    const deal = brandDeals.get(dealId);
    if (!deal) return null;

    const message: BrandDealMessage = {
      id: generateId(),
      senderId,
      senderName,
      senderType,
      content,
      attachments: attachments ?? [],
      readBy: [senderId],
      createdAt: new Date().toISOString(),
    };

    deal.communication.push(message);
    deal.updatedAt = new Date().toISOString();
    return message;
  },

  async recordBrandDealPerformance(
    dealId: string,
    performance: Omit<BrandDealPerformance, 'estimatedRevenue' | 'actualPayout' | 'bonusEarned'>,
  ): Promise<BrandDeal | null> {
    const deal = brandDeals.get(dealId);
    if (!deal) return null;

    const estimatedRevenue = deal.budget.perVideo ?? deal.budget.total;
    let bonusEarned = 0;
    if (deal.budget.bonus?.views && performance.views >= deal.budget.bonus.views && deal.budget.bonus.amount) {
      bonusEarned += deal.budget.bonus.amount;
    }
    if (deal.budget.bonus?.engagement && performance.engagementRate >= deal.budget.bonus.engagement && deal.budget.bonus.amount) {
      bonusEarned += deal.budget.bonus.amount;
    }

    deal.performance = {
      ...performance,
      estimatedRevenue,
      actualPayout: estimatedRevenue + bonusEarned,
      bonusEarned,
    };
    deal.updatedAt = new Date().toISOString();
    return deal;
  },

  async getCreatorBrandDeals(creatorId: string, status?: DealStatus): Promise<BrandDeal[]> {
    let deals = Array.from(brandDeals.values()).filter((d) => d.creatorId === creatorId);
    if (status) deals = deals.filter((d) => d.status === status);
    deals.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return deals;
  },

  async getBrandDealsByBrand(brandId: string): Promise<BrandDeal[]> {
    return Array.from(brandDeals.values())
      .filter((d) => d.brandId === brandId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async createMerchProduct(
    creatorId: string,
    channelId: string,
    data: Omit<MerchProduct, 'id' | 'creatorId' | 'channelId' | 'salesCount' | 'revenue' | 'createdAt' | 'updatedAt'>,
  ): Promise<MerchProduct> {
    const product: MerchProduct = {
      ...data,
      id: generateId(),
      creatorId,
      channelId,
      salesCount: 0,
      revenue: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    merchProducts.set(product.id, product);
    return product;
  },

  async getMerchProducts(channelId: string, activeOnly: boolean = true): Promise<MerchProduct[]> {
    let products = Array.from(merchProducts.values()).filter((p) => p.channelId === channelId);
    if (activeOnly) products = products.filter((p) => p.isActive);
    return products.sort((a, b) => b.salesCount - a.salesCount);
  },

  async updateMerchProduct(
    productId: string,
    updates: Partial<Pick<MerchProduct, 'name' | 'description' | 'price' | 'compareAtPrice' | 'inventory' | 'isActive' | 'isFeatured'>>,
  ): Promise<MerchProduct | null> {
    const product = merchProducts.get(productId);
    if (!product) return null;
    Object.assign(product, updates, { updatedAt: new Date().toISOString() });
    return product;
  },

  async placeMerchOrder(
    buyerId: string,
    creatorId: string,
    items: Array<{ productId: string; variantId: string; quantity: number }>,
    shippingAddress: ShippingAddress,
  ): Promise<MerchOrder> {
    let total = 0;
    const orderItems: MerchOrder['items'] = [];

    for (const item of items) {
      const product = merchProducts.get(item.productId);
      if (!product) throw new Error(`Product ${item.productId} not found`);
      if (!product.isActive) throw new Error(`Product ${product.name} is not available`);
      if (product.inventory < item.quantity) throw new Error(`Insufficient stock for ${product.name}`);

      const variant = product.variants.find((v) => v.id === item.variantId);
      if (!variant) throw new Error(`Variant ${item.variantId} not found`);

      const price = variant.price || product.price;
      total += price * item.quantity;
      orderItems.push({
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
        price,
      });

      product.inventory -= item.quantity;
      product.salesCount += item.quantity;
      product.revenue += price * item.quantity;
    }

    const order: MerchOrder = {
      id: generateId(),
      buyerId,
      creatorId,
      items: orderItems,
      total,
      currency: 'USD',
      status: 'processing',
      shippingAddress,
      trackingNumber: null,
      paymentId: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    merchOrders.set(order.id, order);
    return order;
  },

  async getMerchOrders(creatorId: string, options?: { status?: MerchOrder['status']; limit?: number }): Promise<MerchOrder[]> {
    let orders = Array.from(merchOrders.values()).filter((o) => o.creatorId === creatorId);
    if (options?.status) orders = orders.filter((o) => o.status === options.status);
    orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return orders.slice(0, options?.limit ?? 50);
  },

  async updateMerchOrderStatus(orderId: string, status: MerchOrder['status'], trackingNumber?: string): Promise<MerchOrder | null> {
    const order = merchOrders.get(orderId);
    if (!order) return null;
    order.status = status;
    if (trackingNumber) order.trackingNumber = trackingNumber;
    order.updatedAt = new Date().toISOString();
    return order;
  },

  async createPayoutSchedule(
    channelId: string,
    frequency: PayoutSchedule['frequency'],
    options?: { minimumAmount?: number; bankAccountId?: string },
  ): Promise<PayoutSchedule> {
    const schedule: PayoutSchedule = {
      id: generateId(),
      channelId,
      frequency,
      minimumAmount: options?.minimumAmount ?? 50,
      currency: 'USD',
      nextPayoutDate: getNextPayoutDate(frequency),
      lastPayoutDate: null,
      autoPayout: true,
      bankAccountId: options?.bankAccountId ?? null,
      status: 'active',
    };
    payoutSchedules.set(schedule.id, schedule);
    return schedule;
  },

  async getPayoutSchedule(channelId: string): Promise<PayoutSchedule | null> {
    return Array.from(payoutSchedules.values()).find((s) => s.channelId === channelId) ?? null;
  },

  async getRevenueReport(channelId: string, period: { start: string; end: string }): Promise<RevenueReport> {
    const channelDonations = Array.from(donations.values()).filter(
      (d) => d.recipientChannelId === channelId && d.status === 'completed',
    );
    const channelDeals = Array.from(brandDeals.values()).filter(
      (d) => d.creatorChannelId === channelId && d.performance,
    );
    const channelOrders = Array.from(merchOrders.values()).filter(
      (o) => o.creatorId === channelId && (o.status === 'delivered' || o.status === 'shipped'),
    );

    const donationTotal = channelDonations.reduce((acc, d) => acc + d.amount, 0);
    const sponsorshipTotal = channelDeals.reduce((acc, d) => acc + (d.performance?.actualPayout ?? 0), 0);
    const merchTotal = channelOrders.reduce((acc, o) => acc + o.total, 0);
    const estimatedAdRevenue = Math.floor(Math.random() * 5000) + 1000;

    const total = donationTotal + sponsorshipTotal + merchTotal + estimatedAdRevenue;

    const transactions: RevenueTransaction[] = [
      ...channelDonations.slice(0, 20).map((d) => ({
        id: d.id,
        type: 'donation',
        amount: d.amount,
        currency: d.currency,
        description: `Donation from ${d.isAnonymous ? 'Anonymous' : d.donorId}`,
        status: d.status,
        createdAt: d.createdAt,
      })),
      ...channelDeals.filter((d) => d.performance).slice(0, 10).map((d) => ({
        id: d.id,
        type: 'sponsorship',
        amount: d.performance!.actualPayout,
        currency: d.budget.currency,
        description: `Brand deal: ${d.title}`,
        status: 'completed' as PaymentStatus,
        createdAt: d.updatedAt,
      })),
    ];

    return {
      channelId,
      period,
      total,
      breakdown: {
        adRevenue: estimatedAdRevenue,
        membershipRevenue: 0,
        donationRevenue: donationTotal,
        sponsorshipRevenue: sponsorshipTotal,
        merchandiseRevenue: merchTotal,
        otherRevenue: 0,
      },
      transactions: transactions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
      projections: generateProjections(total),
      comparison: {
        previousPeriod: total * (0.85 + Math.random() * 0.3),
        changePercent: -10 + Math.random() * 30,
        yearOverYear: 20 + Math.random() * 40,
      },
    };
  },

  async submitTaxDocument(userId: string, type: TaxDocument['type'], year: number, url: string): Promise<TaxDocument> {
    const doc: TaxDocument = {
      id: generateId(),
      userId,
      type,
      year,
      url,
      status: 'submitted',
      submittedAt: new Date().toISOString(),
    };
    const docs = taxDocuments.get(userId) ?? [];
    docs.push(doc);
    taxDocuments.set(userId, docs);
    return doc;
  },

  async getTaxDocuments(userId: string): Promise<TaxDocument[]> {
    return taxDocuments.get(userId) ?? [];
  },

  _reset(): void {
    userSubscriptions.clear();
    donations.clear();
    brandDeals.clear();
    merchProducts.clear();
    merchOrders.clear();
    payoutSchedules.clear();
    taxDocuments.clear();
  },
};

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function getNextPayoutDate(frequency: PayoutSchedule['frequency']): string {
  const now = new Date();
  const next = new Date(now);
  switch (frequency) {
    case 'weekly':
      next.setDate(next.getDate() + (7 - next.getDay()));
      break;
    case 'biweekly':
      next.setDate(next.getDate() + 14);
      break;
    case 'monthly':
      next.setMonth(next.getMonth() + 1, 1);
      break;
  }
  return next.toISOString();
}

function generateProjections(currentRevenue: number): RevenueProjection[] {
  const projections: RevenueProjection[] = [];
  const now = new Date();
  for (let i = 1; i <= 6; i++) {
    const month = new Date(now);
    month.setMonth(month.getMonth() + i);
    const growth = 1 + (Math.random() * 0.15 - 0.03);
    projections.push({
      month: month.toISOString().split('T')[0].slice(0, 7),
      projected: Math.round(currentRevenue * Math.pow(growth, i)),
      confidence: Math.max(0.3, 0.9 - i * 0.1),
      factors: ['Seasonal trends', 'Growth trajectory', 'Content pipeline'],
    });
  }
  return projections;
}
