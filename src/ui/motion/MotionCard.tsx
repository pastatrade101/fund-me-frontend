import { Card, type CardProps } from "@mui/material";
import { motion } from "framer-motion";

const MotionBox = motion.div;

export function MotionCard(props: CardProps) {
    return (
        <MotionBox
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.24, ease: "easeOut" }}
            style={{ height: "100%" }}
        >
            <Card {...props} />
        </MotionBox>
    );
}
