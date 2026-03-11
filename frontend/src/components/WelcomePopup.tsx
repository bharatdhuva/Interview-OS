import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight } from "lucide-react";
import { useAuthStore } from "@/store/authStore";

export default function WelcomePopup() {
  const [open, setOpen] = useState(false);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    const justLoggedIn = sessionStorage.getItem("justLoggedIn");
    if (justLoggedIn === "true") {
      setOpen(true);
      sessionStorage.removeItem("justLoggedIn");
    }
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md border-primary/20 bg-background/95 backdrop-blur-sm">
        <DialogHeader className="text-center sm:text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
            className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/5 ring-1 ring-primary/20"
          >
            <Sparkles className="h-8 w-8 text-primary" />
          </motion.div>
          <DialogTitle className="text-xl font-display">
            Welcome back, {user?.name?.split(" ")[0] || "there"}! 👋
          </DialogTitle>
          <DialogDescription className="text-muted-foreground mt-2">
            Great to see you again on <span className="font-semibold text-primary">InterviewOS</span>.
            You&apos;re all set to{" "}
            {user?.role === "interviewer"
              ? "manage your interviews and evaluate candidates."
              : "prepare and ace your upcoming interviews."}
          </DialogDescription>
        </DialogHeader>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-2 flex justify-center"
        >
          <Button
            onClick={() => setOpen(false)}
            className="bg-gradient-primary hover:opacity-90 px-6"
          >
            Let&apos;s Go <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
