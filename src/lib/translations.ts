export const translations = {
    'pt-BR': {
        common: {
            searchPlaceholder: "Buscar produtos...",
            buy: "Comprar",
            nav: {
                home: "Início",
                products: "Produtos",
                about: "Sobre Nós",
                contact: "Contato",
                admin: "Admin"
            }
        },
        home: {
            heroTitle: "Precisão em Odontologia Digital",
            heroSubtitle: "Materiais de alta qualidade e tecnologia de ponta para sua clínica.",
            shopAll: "Ver Todos os Produtos",
            myAccount: "Minha Conta",
            shopByCategory: "Compre por Categoria",
            featuredProducts: "Produtos em Destaque",
            ourProducts: "Nossos Produtos",
            viewAllProducts: "Ver Todos os Produtos",
            categories: {
                crowns: "Coroas",
                implants: "Implantes",
                veneers: "Lentes",
                dentures: "Próteses",
                aligners: "Alinhadores",
                resins: "Resinas",
            }
        }
    },
    'en-US': {
        common: {
            searchPlaceholder: "Search products...",
            buy: "Buy",
            nav: {
                home: "Home",
                products: "Products",
                about: "About Us",
                contact: "Contact",
                admin: "Admin"
            }
        },
        home: {
            heroTitle: "Precision in Digital Dentistry",
            heroSubtitle: "High-quality materials and cutting-edge technology for your clinic.",
            shopAll: "Shop All Products",
            myAccount: "My Account",
            shopByCategory: "Shop by Category",
            featuredProducts: "Featured Products",
            ourProducts: "Our Products",
            viewAllProducts: "View All Products",
            categories: {
                crowns: "Crowns",
                implants: "Implants",
                veneers: "Veneers",
                dentures: "Dentures",
                aligners: "Aligners",
                resins: "Resins",
            }
        }
    },
    'es-ES': {
        common: {
            searchPlaceholder: "Buscar productos...",
            buy: "Comprar",
            nav: {
                home: "Inicio",
                products: "Productos",
                about: "Sobre Nosotros",
                contact: "Contacto",
                admin: "Admin"
            }
        },
        home: {
            heroTitle: "Precisión en Odontología Digital",
            heroSubtitle: "Materiales de alta calidad y tecnología de punta para su clínica.",
            shopAll: "Ver Todos los Productos",
            myAccount: "Mi Cuenta",
            shopByCategory: "Comprar por Categoría",
            featuredProducts: "Productos Destacados",
            ourProducts: "Nuestros Productos",
            viewAllProducts: "Ver Todos los Productos",
            categories: {
                crowns: "Coronas",
                implants: "Implantes",
                veneers: "Carillas",
                dentures: "Prótesis",
                aligners: "Alineadores",
                resins: "Resinas",
            }
        }
    }
};

export type Language = keyof typeof translations;
export type Namespace = keyof typeof translations[Language];
