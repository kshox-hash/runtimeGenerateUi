import express from "express";
import multer from "multer";
import { authMiddleware } from "../../middlewares/auth_middleware";
import { galleryController } from "./gallery.controller";

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (/^image\/(jpeg|png|webp|gif)$/.test(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Solo se aceptan imágenes (JPEG, PNG, WEBP, GIF)."));
    }
  },
});

// Photos
router.post  ("/api/gallery",                           authMiddleware, upload.single("photo"), galleryController.upload);
router.get   ("/api/gallery",                           authMiddleware, galleryController.list);
router.put   ("/api/gallery/:id",                       authMiddleware, galleryController.updateDescription);
router.delete("/api/gallery/:id",                       authMiddleware, galleryController.remove);

// Folders
router.post  ("/api/gallery/folders",                   authMiddleware, galleryController.createFolder);
router.get   ("/api/gallery/folders",                   authMiddleware, galleryController.listFolders);
router.get   ("/api/gallery/folders/full",              authMiddleware, galleryController.listFoldersWithPhotos);
router.put   ("/api/gallery/folders/:id",               authMiddleware, galleryController.updateFolder);
router.delete("/api/gallery/folders/:id",               authMiddleware, galleryController.deleteFolder);

// Public
router.get   ("/api/public/:publicSlug/gallery",        galleryController.listPublic);
router.get   ("/api/public/:publicSlug/gallery/folders",galleryController.listFoldersPublic);

export default router;
