"use client";

import { useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type ConfirmationModalProps = {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "destructive";
};

// Create a function that returns a promise
export const useConfirmationModal = () => {
  const [open, setOpen] = useState(false);
  const [props, setProps] = useState<ConfirmationModalProps>({
    title: "Confirmar acción",
    message: "¿Estás seguro de que deseas continuar?",
    confirmText: "Confirmar",
    cancelText: "Cancelar",
    variant: "default",
  });
  const [resolver, setResolver] = useState<(value: boolean) => void>();

  const confirm = useCallback(
    (modalProps: ConfirmationModalProps): Promise<boolean> => {
      setProps({ ...props, ...modalProps });
      setOpen(true);
      return new Promise<boolean>((resolve) => {
        setResolver(() => resolve);
      });
    },
    [props]
  );

  const handleConfirm = useCallback(() => {
    if (resolver) {
      resolver(true);
    }
    setOpen(false);
  }, [resolver]);

  const handleCancel = useCallback(() => {
    if (resolver) {
      resolver(false);
    }
    setOpen(false);
  }, [resolver]);

  const ConfirmationModal = useCallback(
    () => (
      <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleCancel()}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{props.title}</DialogTitle>
            <DialogDescription>{props.message}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={handleCancel}>
              {props.cancelText}
            </Button>
            <Button
              variant={
                props.variant === "destructive" ? "destructive" : "default"
              }
              onClick={handleConfirm}
            >
              {props.confirmText}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    ),
    [open, props, handleConfirm, handleCancel]
  );

  return { confirm, ConfirmationModal };
};
