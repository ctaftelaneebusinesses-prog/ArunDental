import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Modal } from "./Modal";
import styles from "./CameraCapture.module.css";

interface CameraCaptureProps {
  onCapture: (file: File) => void;
  onClose: () => void;
}

export function CameraCapture({ onCapture, onClose }: CameraCaptureProps) {
  const { t } = useTranslation();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [capturedUrl, setCapturedUrl] = useState<string | null>(null);
  const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch {
        if (!cancelled) setError(t("bookOp.photo.cameraError"));
      }
    }

    startCamera();

    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, [t]);

  function stopStream() {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }

  function handleCapture() {
    const video = videoRef.current;
    if (!video || video.videoWidth === 0) return;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        setCapturedBlob(blob);
        setCapturedUrl(URL.createObjectURL(blob));
        stopStream();
      },
      "image/jpeg",
      0.92
    );
  }

  function handleRetake() {
    if (capturedUrl) URL.revokeObjectURL(capturedUrl);
    setCapturedUrl(null);
    setCapturedBlob(null);
    setError(null);
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "user" }, audio: false })
      .then((stream) => {
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
      })
      .catch(() => setError(t("bookOp.photo.cameraError")));
  }

  function handleUsePhoto() {
    if (!capturedBlob) return;
    const file = new File([capturedBlob], `patient-photo-${Date.now()}.jpg`, { type: "image/jpeg" });
    onCapture(file);
    handleClose();
  }

  function handleClose() {
    stopStream();
    if (capturedUrl) URL.revokeObjectURL(capturedUrl);
    onClose();
  }

  return (
    <Modal title={t("bookOp.photo.cameraTitle")} onClose={handleClose}>
      <div className={styles.frame}>
        {error ? (
          <p className={styles.errorText}>{error}</p>
        ) : capturedUrl ? (
          <img src={capturedUrl} alt="" className={styles.preview} />
        ) : (
          <video ref={videoRef} autoPlay playsInline muted className={styles.preview} />
        )}
      </div>

      <div className={styles.actions}>
        {!error && !capturedUrl && (
          <button type="button" className="btn btn-primary btn-block" onClick={handleCapture}>
            {t("bookOp.photo.cameraCapture")}
          </button>
        )}
        {!error && capturedUrl && (
          <>
            <button type="button" className="btn btn-secondary" onClick={handleRetake}>
              {t("bookOp.photo.cameraRetake")}
            </button>
            <button type="button" className="btn btn-primary" onClick={handleUsePhoto}>
              {t("bookOp.photo.cameraUsePhoto")}
            </button>
          </>
        )}
        <button type="button" className="btn btn-secondary" onClick={handleClose}>
          {t("bookOp.photo.cameraCancel")}
        </button>
      </div>
    </Modal>
  );
}
