"use client";

import { ChangeEvent, useMemo, useState } from "react";
import { Button, Card, Form } from "react-bootstrap";

type MockProfileImage = {
  id: number;
  imageUrl: string;
  caption: string;
  visibility: "public" | "private";
  sortOrder: number;
  isFeatured: boolean;
  createdAtLabel: string;
};

const MAX_PROFILE_IMAGES = 10;

const initialImages: MockProfileImage[] = [
  {
    id: 1,
    imageUrl: "/images/about/group.jpeg",
    caption: "Campaign day with the team.",
    visibility: "public",
    sortOrder: 0,
    isFeatured: true,
    createdAtLabel: "Today",
  },
  {
    id: 2,
    imageUrl: "/images/4x3placeholder.png",
    caption: "Studio setup before the live session.",
    visibility: "public",
    sortOrder: 1,
    isFeatured: false,
    createdAtLabel: "Yesterday",
  },
  {
    id: 3,
    imageUrl: "/images/1x1placeholder.png",
    caption: "Private prep notes board.",
    visibility: "private",
    sortOrder: 2,
    isFeatured: false,
    createdAtLabel: "2d ago",
  },
];

export default function PhotoView() {
  const [images, setImages] = useState<MockProfileImage[]>(initialImages);
  const [captionDraft, setCaptionDraft] = useState("");
  const [visibilityDraft, setVisibilityDraft] = useState<"public" | "private">("public");
  const [errorMessage, setErrorMessage] = useState("");

  const hasReachedLimit = images.length >= MAX_PROFILE_IMAGES;

  const sortedImages = useMemo(
    () => [...images].sort((a, b) => a.sortOrder - b.sortOrder || b.id - a.id),
    [images],
  );

  function handleUpload(event: ChangeEvent<HTMLInputElement>) {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const availableSlots = MAX_PROFILE_IMAGES - images.length;
    if (availableSlots <= 0) {
      setErrorMessage(`You can only upload up to ${MAX_PROFILE_IMAGES} images.`);
      event.target.value = "";
      return;
    }

    const acceptedFiles = Array.from(files).slice(0, availableSlots);
    const droppedCount = files.length - acceptedFiles.length;

    const newItems: MockProfileImage[] = acceptedFiles.map((file, index) => ({
      id: Date.now() + index,
      imageUrl: URL.createObjectURL(file),
      caption: captionDraft.trim() || "New upload",
      visibility: visibilityDraft,
      sortOrder: images.length + index,
      isFeatured: false,
      createdAtLabel: "Just now",
    }));

    setImages((current) => [...current, ...newItems]);
    setCaptionDraft("");

    if (droppedCount > 0) {
      setErrorMessage(
        `Only ${availableSlots} slot${availableSlots === 1 ? "" : "s"} left. Extra files were not added.`,
      );
    } else {
      setErrorMessage("");
    }

    event.target.value = "";
  }

  function removeImage(imageId: number) {
    setImages((current) => {
      const filtered = current.filter((image) => image.id !== imageId);
      return filtered.map((image, index) => ({ ...image, sortOrder: index }));
    });
    setErrorMessage("");
  }

  function markFeatured(imageId: number) {
    setImages((current) =>
      current.map((image) => ({ ...image, isFeatured: image.id === imageId })),
    );
  }

  return (
    <div className="bc-photo-view d-grid gap-3 mt-3 mt-lg-0">
      <Card className="bc-profile-panel-card bc-photo-upload">
        <Card.Body>
          <div className="bc-photo-upload__header">
            <div>
              <h4 className="mb-1">Photo gallery</h4>
              <p className="mb-0">Upload and manage your profile images.</p>
            </div>
            <span className="bc-photo-upload__count">
              {images.length}/{MAX_PROFILE_IMAGES}
            </span>
          </div>

          <div className="bc-photo-upload__controls">
            <Form.Control
              type="text"
              placeholder="Optional caption for new uploads..."
              value={captionDraft}
              onChange={(event) => setCaptionDraft(event.target.value)}
            />
            <Form.Select
              value={visibilityDraft}
              onChange={(event) => setVisibilityDraft(event.target.value as "public" | "private")}
            >
              <option value="public">Public</option>
              <option value="private">Private</option>
            </Form.Select>
            <Form.Control
              type="file"
              accept="image/*"
              multiple
              disabled={hasReachedLimit}
              onChange={handleUpload}
            />
          </div>

          {hasReachedLimit ? (
            <p className="bc-photo-upload__limit mb-0">
              You reached the max of {MAX_PROFILE_IMAGES} images. Remove one to add more.
            </p>
          ) : null}
          {errorMessage ? <p className="bc-photo-upload__error mb-0">{errorMessage}</p> : null}
        </Card.Body>
      </Card>

      <div className="bc-photo-grid">
        {sortedImages.map((image) => (
          <Card key={image.id} className="bc-profile-panel-card bc-photo-item">
            <Card.Body>
              <div className="bc-photo-item__media">
                <img src={image.imageUrl} alt={image.caption || "Profile image"} />
                {image.isFeatured ? <span className="bc-photo-item__featured">Featured</span> : null}
              </div>
              <div className="bc-photo-item__meta">
                <p className="mb-1">{image.caption}</p>
                <small>
                  {image.visibility} · {image.createdAtLabel}
                </small>
              </div>
              <div className="bc-photo-item__actions">
                <Button
                  type="button"
                  className="bc-profile-btn bc-photo-item__btn"
                  onClick={() => markFeatured(image.id)}
                  disabled={image.isFeatured}
                >
                  {image.isFeatured ? "Featured" : "Set featured"}
                </Button>
                <Button
                  type="button"
                  variant="light"
                  className="bc-photo-item__remove"
                  onClick={() => removeImage(image.id)}
                >
                  Remove
                </Button>
              </div>
            </Card.Body>
          </Card>
        ))}
      </div>
    </div>
  );
}