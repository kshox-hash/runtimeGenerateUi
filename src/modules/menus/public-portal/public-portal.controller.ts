import { Request, Response } from "express";
import { findEnabledModulesByUserId } from "../user-modules.repository";
import  {getSlugByValueService} from "../../slug/slug.service";

//VIEWS
import { menuPublicHtml } from "../menu-html";
import { quoteHtml } from "../../quotes/quote-html";

//PRODUCTS FROM QUOTES
import { getProductsRepository } from "../../quotes/products/products.repository";



type Params = {
  publicSlug: string;
};

type ConfiguractionViewType = {
    title : string,
    subTitle : string,
    modulesShop? : [],
    businessName : string,

}

type ConfigurationModuleView = {
    title : string,
    description : string,
    icon : IconsType,
    enabled : true,
    sortOrder : 1,
} 

type IconsType = {
    calendario : '📅',
    phone : '📅',
    resevas : '📅',
}

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
      
      //GET SLUG TO CHEK IF SHOP EXIST
      const slug = await getSlugByValueService(publicSlug);
    
      if (!slug) {
        return res.status(404).send("Negocio no encontrado");
      }
      //GET MODULES SERVICES ENABLED
      const modules = await findEnabledModulesByUserId(slug.user_id);
      //crear url
      const modulesWithUrl = modules.map((m) => ({
      ...m,
      url: `/shop/${slug.public_slug}/${m.code}` 
        }));

      //INSER PARAMS INTO VIEW
      const mainMenuHtml = menuPublicHtml({
          brand: slug.public_slug,   
          title: slug.public_slug,
          subTitle: "Selecciona un servicio para continuar.",
          module: modulesWithUrl             
          });

      return res.status(200).send(mainMenuHtml);

    } catch (error) {

      return res.status(500).send("Error abriendo portal público");
    }
  },
};