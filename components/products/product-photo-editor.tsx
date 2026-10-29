"use client";

import { useRef, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  removeProductPhoto,
  reorderProductPhotos,
  uploadProductPhoto,
} from "@/actions/products";
import { Button } from "@/components/ui/button";
import type { ProductPhotoRow } from "@/lib/data/products-page";
import { checkStorefrontPhoto } from "@/lib/storefront/storefront";

const PHOTO_LIMIT = 6;

export function ProductPhotoEditor({
  productId,
  photos,
}: {
  productId: string;
  photos: readonly ProductPhotoRow[];
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [pending, startTransition] = useTransition();
  const atLimit = photos.length >= PHOTO_LIMIT;

  function refresh() {
    router.refresh();
  }

  function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    const checked = checkStorefrontPhoto(file, photos.length);
    if (!checked.ok) {
      toast.error(checked.error);
      return;
    }

    const formData = new FormData();
    formData.set("productId", productId);
    formData.set("file", file);

    startTransition(async () => {
      const result = await uploadProductPhoto(formData);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Foto adicionada.");
      refresh();
    });
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= photos.length) return;
    const orderedIds = photos.map((photo) => photo.id);
    const [moved] = orderedIds.splice(index, 1);
    if (!moved) return;
    orderedIds.splice(target, 0, moved);

    startTransition(async () => {
      const result = await reorderProductPhotos({ productId, orderedIds });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      refresh();
    });
  }

  function remove(photoId: string) {
    startTransition(async () => {
      const result = await removeProductPhoto({ productId, photoId });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Foto removida.");
      refresh();
    });
  }

  return (
    <section className="space-y-3" aria-label="Fotos do produto">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Fotos</h3>
          <p className="mt-1 text-crm-xs text-muted-foreground">
            JPEG, PNG ou WebP. Até 6 fotos, 5 MB cada. A primeira é a capa e vale para
            todos os tamanhos.
          </p>
        </div>
        <div>
          <input aria-label="Enviar foto" tabIndex={-1}
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            disabled={pending || atLimit}
            onChange={handleFile}
          />
          <Button
            type="button"
            variant="outline"
            disabled={pending || atLimit}
            onClick={() => inputRef.current?.click()}
          >
            Enviar foto
          </Button>
        </div>
      </div>
      {photos.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhuma foto neste produto.</p>
      ) : (
        <ul className="flex gap-3 overflow-x-auto pb-1">
          {photos.map((photo, index) => (
            <li key={photo.id} className="w-28 shrink-0 space-y-2">
              <div className="relative aspect-square overflow-hidden rounded-lg border bg-muted/40">
                {photo.url ? (
                  <Image
                    src={photo.url}
                    alt=""
                    fill
                    unoptimized
                    className="object-cover"
                    sizes="112px"
                  />
                ) : null}
                {index === 0 ? (
                  <span className="absolute left-1 top-1 rounded bg-background/90 px-1.5 py-0.5 text-[0.65rem] font-medium">
                    Capa
                  </span>
                ) : null}
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex gap-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 flex-1 px-2"
                    disabled={pending || index === 0}
                    aria-label="Mover foto para trás"
                    onClick={() => move(index, -1)}
                  >
                    ←
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 flex-1 px-2"
                    disabled={pending || index === photos.length - 1}
                    aria-label="Mover foto para frente"
                    onClick={() => move(index, 1)}
                  >
                    →
                  </Button>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8"
                  disabled={pending}
                  onClick={() => remove(photo.id)}
                >
                  Remover
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
