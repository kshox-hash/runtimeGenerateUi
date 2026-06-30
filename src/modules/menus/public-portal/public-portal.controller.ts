import { Request, Response } from "express";
import { getSlugByValueService } from "../../slug/slug.service";
import { quoteHtml } from "../../quotes/quote-html";
import { getActiveServicesByUserId, getActiveServicesPaginated } from "../../appointments/calendar-services.repository";
import { listFoldersWithPhotos } from "../../gallery/gallery.repository";
import { companyProfileRepository } from "../../profiles/company_profile_repository";
import { findEnabledModulesByUserId } from "../user-modules.repository";
import { renderPortalHtml } from "./portal.screen";
import { StatisticsService } from "../../stadistics/stadistics.service";
import { isBot, shouldCountVisit } from "../../stadistics/visit-tracker";
import { ReviewsRepository } from "../../stadistics/reviews.repository";

const statsService  = new StatisticsService();
const reviewsRepo   = new ReviewsRepository();

function renderLoginPage(slug: string): string {
  const loginUrl = "/auth/portal/" + encodeURIComponent(slug) + "/google";
  return `<!doctype html>
<html lang="es">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Iniciar sesión</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:Inter,system-ui,sans-serif;background:#EEF2F7;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px}
.card{background:#fff;border-radius:20px;padding:40px 32px;max-width:360px;width:100%;box-shadow:0 4px 24px rgba(0,0,0,.08);text-align:center}
.logo{width:56px;height:56px;border-radius:16px;background:#E8F0FE;display:flex;align-items:center;justify-content:center;margin:0 auto 20px;font-size:22px;font-weight:800;color:#4F7FE8}
h1{font-size:18px;font-weight:700;color:#1E293B;margin-bottom:8px}
p{font-size:13.5px;color:#64748B;margin-bottom:28px;line-height:1.5}
.btn-google{display:flex;align-items:center;justify-content:center;gap:12px;width:100%;padding:13px 20px;border:1.5px solid #E2E8F0;border-radius:12px;background:#fff;font-size:14px;font-weight:600;color:#1E293B;cursor:pointer;text-decoration:none;transition:background .15s,box-shadow .15s}
.btn-google:hover{background:#F8FAFC;box-shadow:0 2px 8px rgba(0,0,0,.08)}
.btn-google svg{flex-shrink:0}
</style>
</head>
<body>
<div class="card">
  <div class="logo">A</div>
  <h1>Bienvenido</h1>
  <p>Iniciá sesión para acceder al portal</p>
  <a href="${loginUrl}" class="btn-google">
    <svg width="20" height="20" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
    Continuar con Google
  </a>
</div>
</body>
</html>`;
}




type Params = {
  publicSlug: string;
}; 


export const publicPortalController = {

  async openQuotes(req : Request<Params>, res: Response) : Promise<Response | void>{

    try{
          const { publicSlug } = req.params;

      if (!publicSlug || !publicSlug.trim()) {
        return res.status(400).send("Slug público obligatorio");
      }
      
      //GET SLUG TO CHEK IF SHOP EXIST
      const slug = await getSlugByValueService(publicSlug);

      if (!slug) {
        return res.status(404).send("Negocio no encontrado");
      }


      const products = await getActiveServicesByUserId(slug.user_id);

        const html = quoteHtml({
          brand: slug.business_name,
          title: slug.business_name,
          subTitle: "Selecciona un servicio para continuar.",
          products: products,
          publicSlug: publicSlug  
        });

      return res.status(200).send(html);

    }catch(error){
     
      return res.status(500).send("Error opening QuotesView");
    }
  },
  

  async open(req: Request<Params>, res: Response): Promise<Response | void> {
    try {
      const { publicSlug } = req.params;

      if (!publicSlug || !publicSlug.trim()) {
        return res.status(400).send("Slug público obligatorio");
      }

      // Mostrar pantalla de login si Google auth está activo y no hay sesión de portal
      let portalUser: { name?: string; email?: string; picture?: string } | null = null;
      if (process.env.GOOGLE_CLIENT_ID) {
        const jwt = await import("jsonwebtoken");
        const token: string | undefined = req.cookies?.["portal_session"];
        if (!token) {
          return res.status(200).send(renderLoginPage(publicSlug));
        }
        try {
          const payload = jwt.verify(token, process.env.JWT_SECRET!, { issuer: "portal" }) as any;
          if (payload.slug && payload.slug !== publicSlug) {
            res.clearCookie("portal_session");
            return res.status(200).send(renderLoginPage(publicSlug));
          }
          portalUser = { name: payload.name, email: payload.email, picture: payload.picture };
        } catch {
          res.clearCookie("portal_session");
          return res.status(200).send(renderLoginPage(publicSlug));
        }
      }

      const slug = await getSlugByValueService(publicSlug);

      if (!slug) {
        return res.status(404).send("Negocio no encontrado");
      }

      const [productsResult, profile, enabledModules, galleryData] = await Promise.all([
        getActiveServicesPaginated(slug.user_id, 20, 0),
        companyProfileRepository.getByUserId(slug.user_id),
        findEnabledModulesByUserId(slug.user_id),
        listFoldersWithPhotos(slug.user_id),
      ]);

      const products = productsResult.rows;

      const html = renderPortalHtml({
        businessName:   slug.business_name ?? publicSlug,
        publicSlug,
        userId:         slug.user_id,
        productCount:   productsResult.total,
        phone:          profile?.phone           ?? null,
        address:        profile?.address         ?? null,
        city:           profile?.city            ?? null,
        brandColor:     profile?.brand_color     ?? null,
        description:    profile?.description     ?? null,
        instagramUrl:   profile?.instagram_url   ?? null,
        whatsappNumber: profile?.whatsapp_number ?? null,
        businessHours:  profile?.business_hours  ?? null,
        coverImage:     profile?.cover_image     ?? null,
        enabledModules,
        products: products.map((p: any) => ({
          id:          String(p.id),
          name:        String(p.name || ""),
          price:       Number(p.price || 0),
          description: p.description ?? null,
          color:       String(p.color || "#63ACF1"),
          photos:      Array.isArray(p.photos) ? p.photos.map(String) : [],
        })),
        galleryFolders: galleryData.folders.map(({ folder, photos }) => ({
          id:          folder.id,
          name:        folder.name,
          description: folder.description,
          photos:      photos.map(p => ({ id: p.id, url: p.url, description: p.description })),
        })),
        orphanPhotos: galleryData.orphanPhotos.map(p => ({
          id:          p.id,
          url:         p.url,
          description: p.description,
        })),
        portalUser: portalUser ?? null,
      });

      const ip = req.ip ?? req.socket?.remoteAddress ?? "";
      const ua = req.headers["user-agent"];
      if (!isBot(ua) && shouldCountVisit(ip, slug.user_id)) {
        statsService.increment(slug.user_id, "link_opens").catch(() => {});
      }

      return res.status(200).send(html);

    } catch (error) {
      return res.status(500).send("Error abriendo portal público");
    }
  },

  async submitReview(req: Request, res: Response): Promise<Response> {
    try {
      const slug = await getSlugByValueService(String(req.params["publicSlug"]));
      if (!slug) return res.status(404).json({ ok: false, message: "Negocio no encontrado." });

      const { rating, comment } = req.body || {};
      const r = Number(rating);
      if (!r || r < 1 || r > 5) {
        return res.status(400).json({ ok: false, message: "Calificación inválida (1-5)." });
      }

      const portalUser = (req as any).portalUser as { name?: string; email?: string; picture?: string } | undefined;

      await reviewsRepo.create(
        slug.user_id, r,
        comment?.trim() || null,
        portalUser?.name ?? null,
        null,
        portalUser?.name ?? null,
        portalUser?.email ?? null,
        portalUser?.picture ?? null,
      );

      return res.json({ ok: true });
    } catch (e: any) {
      console.error("[submitReview]", e);
      return res.status(500).json({ ok: false, message: "Error al guardar la reseña." });
    }
  },
};