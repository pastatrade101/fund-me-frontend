export interface AuthSession {
    access_token: string;
    refresh_token: string;
}

export interface AuthUserProfile {
    id: string;
    email: string;
    roles: string[];
    member?: Member | null;
    staff?: StaffProfile | null;
}

export interface Member {
    id: string;
    auth_user_id?: string | null;
    full_name: string;
    department: string;
    phone: string;
    email: string;
    employment_type: "permanent" | "contract" | "intern";
    status: "pending_signup" | "active" | "inactive";
    created_at: string;
}

export interface StaffProfile {
    id: string;
    auth_user_id?: string | null;
    full_name: string;
    phone: string;
    email: string;
    role: "admin" | "fund_manager";
    status: "active" | "inactive";
    created_at: string;
}

export interface Department {
    id: string;
    name: string;
    status: "active" | "inactive";
    created_at: string;
    updated_at?: string;
}

export interface PlatformFeeSettings {
    id: string;
    platform_fee_percentage: number;
    gateway_fee_percentage: number;
    gateway_flat_fee: number;
    minimum_contribution_amount: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface ContributionPolicy {
    id: string;
    name: string;
    event_type: "funeral" | "wedding" | "medical_emergency";
    amount: number;
    eligibility_rule: "all_staff" | "permanent_staff" | "department_members" | "custom_rules";
    eligible_employment_types: Array<"permanent" | "contract" | "intern">;
    eligible_family: Array<"member" | "spouse" | "parent" | "child">;
    deadline_days: number;
    department_scope: string[];
    custom_rule_json: Record<string, unknown>;
    is_active: boolean;
    used_event_count?: number;
    event_type_locked?: boolean;
    created_at: string;
}

export interface ContributionEventSummary {
    event_id: string;
    title: string;
    event_type: "funeral" | "wedding" | "medical_emergency";
    status: "draft" | "active" | "collection" | "closed" | "archived";
    deadline: string;
    target_amount?: number | null;
    expected_total: number;
    collected_total: number;
    pending_total: number;
    paid_members: number;
    pending_members: number;
    can_delete?: boolean;
}

export interface ContributionLedgerRow {
    id: string;
    event_id: string;
    member_id: string;
    expected_amount: number;
    amount_paid: number;
    status: "pending" | "paid" | "partial" | "waived";
    payment_method?: "mobile_money" | "cash" | "bank_transfer" | "payroll_deduction" | null;
    payment_reference?: string | null;
    created_at: string;
    paid_at?: string | null;
    events?: {
        title: string;
        event_type: string;
        deadline: string;
    };
    members?: {
        full_name: string;
        department: string;
        email?: string;
    };
}

export interface ContributionLedgerSummary {
    total_rows: number;
    collected_total: number;
    pending_total: number;
    settled_rows: number;
    open_rows: number;
    settlement_rate: number;
}

export interface ContributionPaymentOrderStatus {
    order_id: string;
    contribution_id: string;
    event_id: string;
    member_id: string;
    status: "pending" | "paid" | "posted" | "failed" | "expired";
    amount: number;
    contribution_amount: number;
    platform_fee: number;
    gateway_fee: number;
    gross_amount: number;
    net_amount: number;
    total_to_pay: number;
    posted_amount: number;
    currency: string;
    payment_method: "mobile_money";
    phone: string;
    gateway: string;
    gateway_reference?: string | null;
    external_id: string;
    expires_at?: string | null;
    initiated_at: string;
    paid_at?: string | null;
    posted_at?: string | null;
    failed_at?: string | null;
    expired_at?: string | null;
    error_message?: string | null;
    contribution_status?: ContributionLedgerRow["status"] | null;
    amount_paid: number;
    outstanding_amount: number;
}

export interface DashboardSummary {
    active_events: number;
    total_collected: number;
    pending_contributions: number;
    participation_rate: number;
    platform_revenue_accrued: number;
}

export type GovernanceOverallStatus = "healthy" | "degraded" | "critical";
export type GovernanceTrendDirection = "up" | "down" | "neutral";
export type GovernanceTrendTone = "positive" | "negative" | "neutral";
export type GovernanceHealthStatus = "healthy" | "warning" | "critical";
export type GovernanceAlertSeverity = "critical" | "warning" | "info";

export interface GovernanceMetricTrend {
    label: string;
    direction: GovernanceTrendDirection;
    tone: GovernanceTrendTone;
}

export interface GovernanceMetric {
    value: number;
    trend: GovernanceMetricTrend;
}

export interface GovernanceHealthItem {
    key: string;
    label: string;
    value: string;
    status: GovernanceHealthStatus;
    detail: string;
}

export interface GovernanceAlert {
    id: string;
    severity: GovernanceAlertSeverity;
    title: string;
    detail: string;
    timestamp: string;
}

export interface GovernanceActivityItem {
    id: string;
    title: string;
    detail: string;
    timestamp: string;
    severity: "info" | "success" | "warning";
}

export interface GovernanceTrendPoint {
    date: string;
    total_contributions: number;
    total_payments: number;
    failed_payments: number;
}

export interface AdminGovernanceOverview {
    generated_at: string;
    overall_status: GovernanceOverallStatus;
    platform_kpis: {
        fund_managers: GovernanceMetric;
        active_staff: GovernanceMetric;
        total_members: GovernanceMetric;
        audit_entries_7d: GovernanceMetric;
        active_actors_7d: GovernanceMetric;
    };
    financial_integrity: {
        total_contributions: GovernanceMetric;
        pending_payments: GovernanceMetric;
        failed_payments: GovernanceMetric;
        refund_requests: GovernanceMetric;
        platform_revenue: GovernanceMetric;
    };
    system_health: GovernanceHealthItem[];
    system_alerts: GovernanceAlert[];
    activity_feed: GovernanceActivityItem[];
    contribution_trend: GovernanceTrendPoint[];
}

export interface StaffSummary {
    total_staff: number;
    fund_managers: number;
    active_fund_managers: number;
    inactive_staff: number;
    total_members: number;
}

export interface AuditLogEntry {
    id: string;
    user_id?: string | null;
    action: string;
    entity: string;
    entity_id?: string | null;
    metadata?: Record<string, unknown> | null;
    timestamp: string;
}

export interface AuditLogSummary {
    total_logs: number;
    last_7_days_logs: number;
    active_actors_last_7_days: number;
    latest_action_at?: string | null;
    latest_action?: string | null;
    latest_entity?: string | null;
}

export interface PaginationMeta {
    page: number;
    page_size: number;
    total: number;
}

export interface EventPreviewMemberRow {
    member_id: string;
    full_name: string;
    department: string;
    contribution_amount: number;
}

export interface EventPreviewResponse {
    policy: ContributionPolicy;
    event: {
        title: string;
        beneficiary_name: string;
        relationship_to_member: "member" | "spouse" | "parent" | "child";
        description: string;
        target_amount: number;
        deadline: string;
    };
    preview: {
        total_members: number;
        eligible_members: number;
        target_amount: number;
        contribution_amount: number;
        expected_total: number;
    };
    members: EventPreviewMemberRow[];
}

export interface ContributionEventDetail {
    event: {
        id: string;
        title: string;
        description?: string | null;
        beneficiary_name: string;
        relationship_to_member: "member" | "spouse" | "parent" | "child";
        event_type: "funeral" | "wedding" | "medical_emergency";
        policy_id: string;
        target_amount?: number | null;
        deadline: string;
        status: "draft" | "active" | "collection" | "closed" | "archived";
        created_at: string;
        contribution_policies: ContributionPolicy;
    };
    summary: ContributionEventSummary;
}

export interface EventFinancialSummary {
    event_id: string;
    total_contributions: number;
    platform_fees: number;
    gateway_fees: number;
    net_event_balance: number;
    contributors_count: number;
}

export interface DepartmentParticipationRow {
    department: string;
    events_participated: number;
    total_contributed: number;
}

export interface YearlyContributionSummaryRow {
    year: string;
    total_contributed: number;
    payments_recorded: number;
}
