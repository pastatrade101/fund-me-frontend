import {
    Alert,
    Button,
    LinearProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    MenuItem,
    Stack,
    TextField
} from "@mui/material";

import { formatCurrency } from "../../pages/page-format";

interface ContributionPaymentStartDialogProps {
    open: boolean;
    amount: number;
    phone: string;
    onPhoneChange: (value: string) => void;
    onClose: () => void;
    onSubmit: () => void;
    loading?: boolean;
    submitting?: boolean;
}

export function ContributionPaymentStartDialog({
    open,
    amount,
    phone,
    onPhoneChange,
    onClose,
    onSubmit,
    loading = false,
    submitting = false
}: ContributionPaymentStartDialogProps) {
    return (
        <Dialog open={open} onClose={() => !submitting && !loading && onClose()} fullWidth maxWidth="sm">
            <DialogTitle>Pay Contribution</DialogTitle>
            <DialogContent dividers>
                {loading ? (
                    <Stack spacing={2} sx={{ pt: 0.5 }}>
                        <Alert severity="info">
                            Preparing your contribution payment. We are checking if there is already an active Snippe mobile money request for this event.
                        </Alert>
                        <LinearProgress />
                    </Stack>
                ) : (
                    <Stack spacing={2} sx={{ pt: 0.5 }}>
                        <Alert severity="info">
                            This payment uses Snippe mobile money. A prompt will be pushed to the handset number below.
                        </Alert>
                        <TextField
                            label="Amount"
                            value={formatCurrency(amount)}
                            InputProps={{ readOnly: true }}
                        />
                        <TextField
                            select
                            label="Payment Method"
                            value="mobile_money"
                            InputProps={{ readOnly: true }}
                            helperText="Member self-service payments currently use Snippe mobile money."
                        >
                            <MenuItem value="mobile_money">Mobile Money</MenuItem>
                        </TextField>
                        <TextField
                            label="Mobile number"
                            value={phone}
                            onChange={(event) => onPhoneChange(event.target.value)}
                            helperText="Use the mobile money number that should receive the approval prompt."
                        />
                    </Stack>
                )}
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button onClick={onClose} disabled={submitting || loading}>
                    Cancel
                </Button>
                <Button
                    variant="contained"
                    disabled={submitting || loading || !phone.trim()}
                    onClick={onSubmit}
                >
                    {submitting ? "Sending prompt..." : "Send mobile money prompt"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
