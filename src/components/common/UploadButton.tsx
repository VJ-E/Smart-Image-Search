"use client";
import { useRef, useCallback } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export const UploadButton = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleImageUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const formData = new FormData();
      formData.append("file", file);

      try {
        const res = await fetch("http://localhost:8000/find_similar_products", {
          method: "POST",
          body: formData,
        });

        if (res.ok) {
          const data = await res.json();
          const productIds = data.similar_product_ids;
          router.push(`/search/results?ids=${productIds.join(",")}`);
        } else {
          toast.error("Search failed");
        }
      } catch (err) {
        toast.error("Error searching for similar products");
      }
    },
    [router]
  );

  return (
    <>
      <button
        onClick={() => fileInputRef.current?.click()}
        className="text-sm py-3 px-3 rounded-md transition-all text-[#EDEDED] hover:bg-[#1F1F1F]"
        aria-label="Upload Image"
      >
        📷 Upload
      </button>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageUpload}
        accept="image/*"
        className="hidden"
      />
    </>
  );
};
