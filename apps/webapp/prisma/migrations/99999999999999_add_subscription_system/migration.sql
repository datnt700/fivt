-- Add subscription system to existing schema

-- Create enum for service types
CREATE TYPE "ServiceType" AS ENUM ('DASHBOARD', 'BUDGET_TRACKING', 'TRANSACTION_MANAGEMENT', 'BANKING_INTEGRATION', 'AI_CHATBOT');

-- Create enum for subscription status
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'CANCELLED', 'EXPIRED', 'PENDING');

-- Create services table
CREATE TABLE "Service" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" "ServiceType" NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "features" TEXT[],
    "planIds" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);

-- Create user subscriptions table
CREATE TABLE "UserSubscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'PENDING',
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3),
    "autoRenew" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserSubscription_pkey" PRIMARY KEY ("id")
);

-- Create subscription plans table
CREATE TABLE "SubscriptionPlan" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DECIMAL(10,2) NOT NULL,
    "billingInterval" TEXT NOT NULL DEFAULT 'MONTHLY', -- MONTHLY, YEARLY
    "serviceIds" TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "maxUsers" INTEGER DEFAULT 1,
    "features" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SubscriptionPlan_pkey" PRIMARY KEY ("id")
);

-- Add foreign keys
ALTER TABLE "UserSubscription" ADD CONSTRAINT "UserSubscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UserSubscription" ADD CONSTRAINT "UserSubscription_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Add unique constraint for user-service combination
ALTER TABLE "UserSubscription" ADD CONSTRAINT "UserSubscription_userId_serviceId_key" UNIQUE ("userId", "serviceId");

-- Create indexes for performance
CREATE INDEX "UserSubscription_userId_idx" ON "UserSubscription"("userId");
CREATE INDEX "UserSubscription_serviceId_idx" ON "UserSubscription"("serviceId");
CREATE INDEX "UserSubscription_status_idx" ON "UserSubscription"("status");
CREATE INDEX "Service_type_idx" ON "Service"("type");

-- Insert default services with proper UUIDs
INSERT INTO "Service" ("id", "name", "description", "type", "price", "features", "planIds", "updatedAt") VALUES
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Dashboard Service', 'Comprehensive financial overview and analytics', 'DASHBOARD', 9.99, ARRAY['Real-time overview', 'Financial analytics', 'Custom widgets', 'Data visualization'], ARRAY['plan_basic', 'plan_premium', 'plan_enterprise'], CURRENT_TIMESTAMP),
('b2c3d4e5-f6g7-8901-bcde-f12345678901', 'Budget Tracking', 'Advanced budget management and tracking', 'BUDGET_TRACKING', 14.99, ARRAY['Budget creation', 'Expense tracking', 'Budget alerts', 'Category management', 'Spending insights'], ARRAY['plan_premium', 'plan_enterprise'], CURRENT_TIMESTAMP),
('c3d4e5f6-g7h8-9012-cdef-123456789012', 'Transaction Management', 'Manual transaction management system', 'TRANSACTION_MANAGEMENT', 7.99, ARRAY['Manual transactions', 'Transaction history', 'Categories', 'Export data'], ARRAY['plan_basic', 'plan_premium', 'plan_enterprise'], CURRENT_TIMESTAMP),
('d4e5f6g7-h8i9-0123-defa-234567890123', 'Banking Integration', 'Connect and sync with your bank accounts', 'BANKING_INTEGRATION', 19.99, ARRAY['Bank account sync', 'Automatic transactions', 'Multiple banks', 'Real-time updates'], ARRAY['plan_enterprise'], CURRENT_TIMESTAMP),
('e5f6g7h8-i9j0-1234-efab-345678901234', 'AI Financial Assistant', 'Intelligent financial advice and support', 'AI_CHATBOT', 12.99, ARRAY['24/7 AI support', 'Personalized advice', 'Financial insights', 'Smart recommendations'], ARRAY['plan_premium', 'plan_enterprise'], CURRENT_TIMESTAMP);

-- Insert subscription plans with proper service UUIDs
INSERT INTO "SubscriptionPlan" ("id", "name", "description", "price", "serviceIds", "features", "updatedAt") VALUES
('plan_basic', 'Basic Plan', 'Essential financial tools', 19.99, ARRAY['a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'c3d4e5f6-g7h8-9012-cdef-123456789012'], ARRAY['Dashboard access', 'Manual transactions', 'Basic analytics'], CURRENT_TIMESTAMP),
('plan_premium', 'Premium Plan', 'Advanced financial management', 39.99, ARRAY['a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'b2c3d4e5-f6g7-8901-bcde-f12345678901', 'c3d4e5f6-g7h8-9012-cdef-123456789012', 'e5f6g7h8-i9j0-1234-efab-345678901234'], ARRAY['All Basic features', 'Budget tracking', 'AI assistant', 'Advanced analytics'], CURRENT_TIMESTAMP),
('plan_enterprise', 'Enterprise Plan', 'Complete financial suite', 69.99, ARRAY['a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'b2c3d4e5-f6g7-8901-bcde-f12345678901', 'c3d4e5f6-g7h8-9012-cdef-123456789012', 'd4e5f6g7-h8i9-0123-defa-234567890123', 'e5f6g7h8-i9j0-1234-efab-345678901234'], ARRAY['All Premium features', 'Banking integration', 'Priority support', 'Custom integrations'], CURRENT_TIMESTAMP);