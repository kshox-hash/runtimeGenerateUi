import { Request, Response } from "express";
import { getSlugByValueService } from "../../slug/slug.service";
import { quoteHtml } from "../../quotes/quote-html";
import { getProductsRepository, getActiveProductsRepository } from "../../quotes/products/products.repository";
import { companyProfileRepository } from "../../profiles/company_profile_repository";
import { findEnabledModulesByUserId } from "../user-modules.repository";
import { renderPortalHtml } from "./portal.screen";




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


      const products = await getProductsRepository(slug.user_id);

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

      const slug = await getSlugByValueService(publicSlug);

      if (!slug) {
        return res.status(404).send("Negocio no encontrado");
      }

      const [products, profile, enabledModules] = await Promise.all([
        getActiveProductsRepository(slug.user_id),
        companyProfileRepository.getByUserId(slug.user_id),
        findEnabledModulesByUserId(slug.user_id),
      ]);

      const html = renderPortalHtml({
        businessName: slug.business_name ?? publicSlug,
        publicSlug,
        productCount: products.length,
        phone:       profile?.phone       ?? null,
        address:     profile?.address     ?? null,
        city:        profile?.city        ?? null,
        brandColor:  profile?.brand_color ?? null,
        enabledModules,
        products: products.map((p: any) => ({
          id:          String(p.id),
          name:        String(p.name || ""),
          price:       Number(p.price || 0),
          description: p.description ?? null,
        })),
      });

      return res.status(200).send(html);

    } catch (error) {
      return res.status(500).send("Error abriendo portal público");
    }
  },
};