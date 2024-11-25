import React, { forwardRef, useImperativeHandle, useState } from "react";
import {
  Modal,
  Button,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@nextui-org/react";

const ConfirmationModal = forwardRef(
  ({ message = "¿Desea confirmar?" }: { message: string }, ref) => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [resolvePromise, setResolvePromise] =
      useState<(value: boolean) => void | null>();

    // Exponer métodos para abrir el modal
    useImperativeHandle(ref, () => ({
      openModal: () =>
        new Promise<boolean>((resolve) => {
          onOpen();
          setResolvePromise(() => resolve);
        }),
    }));

    const handleConfirm = () => {
      if (resolvePromise) resolvePromise(true);
      onClose();
    };

    const handleCancel = () => {
      if (resolvePromise) resolvePromise(false);
      onClose();
    };

    return (
      <Modal
        closeButton
        aria-labelledby="modal-title"
        isOpen={isOpen}
        onClose={onClose}
      >
        <ModalContent>
          <>
            <ModalHeader className="flex flex-col gap-1">
              Confirmación
            </ModalHeader>
            <ModalBody>{message}</ModalBody>
            <ModalFooter>
              <Button color="primary" onClick={handleCancel}>
                Cancelar
              </Button>
              <Button color="warning" onClick={handleConfirm}>
                Confirmar
              </Button>
            </ModalFooter>
          </>
        </ModalContent>
      </Modal>
    );
  }
);
// Define un nombre para depuración
ConfirmationModal.displayName = "ConfirmationModal";
export default ConfirmationModal;
