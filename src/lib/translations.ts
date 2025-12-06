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
            },
            productsPage: {
                subtitle: "Explore nossa seleção completa de produtos e serviços odontológicos digitais.",
                filters: "Filtros",
                priceRange: "Faixa de Preço",
                loading: "Carregando produtos...",
                noProductsFound: "Nenhum produto encontrado",
                adjustFilters: "Ajuste os filtros para encontrar o que procura.",
            },
            productCard: {
                requiresUpload: "Upload obrigatório",
                code: "Código",
                noImage: "Sem imagem"
            }
        },
        product: {
            backToProducts: "Voltar para produtos",
            code: "Código",
            deliveryTime: "Prazo estimado de entrega",
            days: "dia(s)",
            customizeAndBuy: "Personalizar e Comprar",
            addToCart: "Adicionar ao Carrinho",
            requiresStlUpload: "Necessário Envio de Arquivo STL",
            tags: "Indicações / tags",
            requiredFiles: "Arquivos necessários",
            optionalFiles: "Arquivos opcionais",
            productionFlow: "Fluxo de produção",
            modal: {
                title: "Personalize seu Produto",
                step: "Passo {current} de {total}",
                steps: {
                    teeth: "Seleção de Dentes",
                    color: "Cor e Material",
                    files: "Upload de Arquivos",
                    patient: "Ficha do Paciente",
                    review: "Revisão"
                },
                color: {
                    title: "SELECIONE A COR DESEJADA"
                },
                files: {
                    title: "Upload de Arquivos Clínicos",
                    clickToUpload: "Clique para enviar",
                    orDragAndDrop: "ou arraste e solte",
                    fileTypes: "Arquivos STL, PLY, OBJ (MAX. 100MB)",
                    currentFile: "Arquivo atual no caso",
                    uploadToReplace: "Envie um novo arquivo se desejar substituir.",
                    uploadedFiles: "Arquivos Carregados",
                },
                patient: {
                    title: "Ficha do Paciente",
                    name: "Nome do Paciente",
                    age: "Idade",
                    clinicalNotes: "Observações Clínicas",
                    clinicalNotesPlaceholder: "Ex: Paciente com histórico de bruxismo...",
                    dentistNotes: "Observações do Dentista",
                    dentistNotesPlaceholder: "Ex: Favor conferir o ponto de contato...",
                },
                review: {
                    title: "Revise as informações",
                    product: "Produto",
                    teeth: "Dentes",
                    none: "Nenhum",
                    color: "Cor",
                    notSelected: "Não selecionada",
                    files: "Arquivos",
                    newFiles: "novo(s)",
                    existingFile: "existente",
                    patient: "Paciente",
                    notInformed: "Não informado",
                },
                buttons: {
                    back: "Voltar",
                    next: "Avançar",
                    addToCart: "Adicionar ao carrinho"
                }
            }
        },
        footer: {
            tagline: "O futuro da odontologia digital, entregue na sua clínica.",
            headings: {
                shop: "Loja",
                company: "Empresa",
                account: "Conta"
            },
            links: {
                crowns: "Coroas e Pontes",
                implants: "Implantes",
                veneers: "Lentes de Contato",
                dentures: "Próteses",
                about: "Sobre Nós",
                contact: "Contato",
                shipping: "Política de Envio",
                privacy: "Política de Privacidade",
                myAccount: "Minha Conta",
                myOrders: "Meus Pedidos",
                login: "Login",
                register: "Cadastrar"
            },
            copyright: "Todos os direitos reservados."
        },
        products: {
          "ZIRC-001-C72B": {
            name: "Coroa de Zircônia",
            description: "Coroa de zircônia multicamadas de alta translucidez, perfeita para resultados estéticos e funcionais.",
            tags: ["Estética", "Resistência", "Coroas Unitárias"],
            productionFlow: ["Modelagem", "Fresagem", "Sinterização", "Acabamento"]
          },
          "EMAX-V01-B5A1": {
            name: "Lente E-Max",
            description: "Lente de dissilicato de lítio para estética máxima.",
            tags: ["Alta Estética", "Lentes de Contato", "Facetas"],
            productionFlow: ["Enceramento", "Injeção", "Maquiagem", "Glaze"]
          },
           "TI-IMP-001-9F3E": {
            name: "Implante de Titânio",
            description: "Implante de titânio Grau 5 com superfície SLA para osseointegração aprimorada.",
            tags: ["Implante", "Titânio", "Cirurgia"],
            productionFlow: ["Usinagem", "Tratamento de Superfície", "Esterilização"]
          },
           "DENT-F01-A4B2": {
            name: "Prótese Total",
            description: "Prótese total em acrílico de alto impacto com dentes premium.",
            tags: ["Prótese Removível", "Reabilitação Total"],
            productionFlow: ["Modelagem", "Articulação", "Acrilização", "Polimento"]
          },
           "ALIGN-01-D6C3": {
            name: "Conjunto de Alinhadores",
            description: "Conjunto completo de alinhadores transparentes personalizados para tratamento ortodôntico.",
            tags: ["Ortodontia", "Estética", "Invisível"],
            productionFlow: ["Setup Virtual", "Impressão 3D", "Estampagem", "Recorte a Laser"]
          },
           "COMP-R01-E8D4": {
            name: "Kit de Resina Composta",
            description: "Kit de resina composta universal para restaurações anteriores e posteriores.",
            tags: ["Restauração", "Clínica", "Material"],
            productionFlow: ["N/A"]
          },
           "PFM-C01-F2A5": {
            name: "Coroa Metalocerâmica",
            description: "Coroa de porcelana fundida sobre metal para um equilíbrio entre resistência e estética.",
            tags: ["PFM", "Resistência", "Tradicional"],
            productionFlow: ["Estrutura Metálica", "Aplicação de Porcelana", "Glaze"]
          },
           "CUST-ABUT-01-1B9F": {
            name: "Abutment Personalizado",
            description: "Abutment personalizado em CAD/CAM para um encaixe perfeito da restauração do implante.",
            tags: ["Implante", "Prótese sobre Implante", "CAD/CAM"],
            productionFlow: ["Desenho CAD", "Usinagem CAM", "Acabamento"]
          },
           "SURG-G01-3C8E": {
            name: "Guia Cirúrgico",
            description: "Guia cirúrgico impresso em 3D para colocação precisa de implantes.",
            tags: ["Cirurgia Guiada", "Implante", "Impressão 3D"],
            productionFlow: ["Planejamento", "Impressão 3D", "Pós-processamento"]
          },
           "NG-01-5E6D": {
            name: "Placa de Bruxismo",
            description: "Placa de mordida personalizada para bruxismo e apertamento.",
            tags: ["Bruxismo", "Oclusão", "Placa Miorrelaxante"],
            productionFlow: ["Modelagem", "Estampagem a Vácuo", "Ajuste e Polimento"]
          },
           "MB-01-7A4B": {
            name: "Ponte Maryland",
            description: "Ponte adesiva, uma opção conservadora para substituir um único dente.",
            tags: ["Prótese Fixa", "Adesiva", "Conservador"],
            productionFlow: ["Desenho CAD", "Fresagem", "Maquiagem", "Glaze"]
          },
           "WAX-01-9D2C": {
            name: "Enceramento Diagnóstico",
            description: "Enceramento diagnóstico digital ou analógico para planejamento de tratamento.",
            tags: ["Planejamento", "Diagnóstico", "Estética"],
            productionFlow: ["Escaneamento", "Desenho Digital", "Impressão 3D (Opcional)"]
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
            },
            productsPage: {
                subtitle: "Explore our complete selection of digital dental products and services.",
                filters: "Filters",
                priceRange: "Price Range",
                loading: "Loading products...",
                noProductsFound: "No products found",
                adjustFilters: "Adjust the filters to find what you're looking for.",
            },
            productCard: {
                requiresUpload: "Upload required",
                code: "Code",
                noImage: "No image"
            }
        },
        product: {
            backToProducts: "Back to products",
            code: "Code",
            deliveryTime: "Estimated delivery time",
            days: "day(s)",
            customizeAndBuy: "Customize and Buy",
            addToCart: "Add to Cart",
            requiresStlUpload: "STL File Upload Required",
            tags: "Indications / tags",
            requiredFiles: "Required files",
            optionalFiles: "Optional files",
            productionFlow: "Production flow",
             modal: {
                title: "Customize Your Product",
                step: "Step {current} of {total}",
                steps: {
                    teeth: "Teeth Selection",
                    color: "Color and Material",
                    files: "File Upload",
                    patient: "Patient Record",
                    review: "Review"
                },
                color: {
                    title: "SELECT THE DESIRED COLOR"
                },
                files: {
                    title: "Upload Clinical Files",
                    clickToUpload: "Click to upload",
                    orDragAndDrop: "or drag and drop",
                    fileTypes: "STL, PLY, OBJ files (MAX. 100MB)",
                    currentFile: "Current file in the case",
                    uploadToReplace: "Upload a new file if you want to replace it.",
                    uploadedFiles: "Uploaded Files",
                },
                patient: {
                    title: "Patient Record",
                    name: "Patient Name",
                    age: "Age",
                    clinicalNotes: "Clinical Notes",
                    clinicalNotesPlaceholder: "E.g., Patient with a history of bruxism...",
                    dentistNotes: "Dentist's Notes",
                    dentistNotesPlaceholder: "E.g., Please check the contact point...",
                },
                review: {
                    title: "Review the information",
                    product: "Product",
                    teeth: "Teeth",
                    none: "None",
                    color: "Color",
                    notSelected: "Not selected",
                    files: "Files",
                    newFiles: "new",
                    existingFile: "existing",
                    patient: "Patient",
                    notInformed: "Not informed",
                },
                buttons: {
                    back: "Back",
                    next: "Next",
                    addToCart: "Add to cart"
                }
            }
        },
        footer: {
            tagline: "The future of digital dentistry, delivered to your clinic.",
            headings: {
                shop: "Shop",
                company: "Company",
                account: "Account"
            },
            links: {
                crowns: "Crowns & Bridges",
                implants: "Implants",
                veneers: "Veneers",
                dentures: "Dentures",
                about: "About Us",
                contact: "Contact",
                shipping: "Shipping Policy",
                privacy: "Privacy Policy",
                myAccount: "My Account",
                myOrders: "My Orders",
                login: "Login",
                register: "Register"
            },
            copyright: "All rights reserved."
        },
        products: {
          "ZIRC-001-C72B": {
            name: "Zirconia Crown",
            description: "High-translucency multilayered zirconia crown, perfect for aesthetic and functional results.",
            tags: ["Aesthetic", "Strength", "Single Crowns"],
            productionFlow: ["Modeling", "Milling", "Sintering", "Finishing"]
          },
          "EMAX-V01-B5A1": {
            name: "E-Max Veneer",
            description: "Lithium disilicate glass-ceramic veneer for ultimate aesthetics.",
            tags: ["High-Aesthetics", "Veneers", "Facings"],
            productionFlow: ["Wax-up", "Pressing", "Staining", "Glaze"]
          },
          "TI-IMP-001-9F3E": {
            name: "Titanium Implant",
            description: "Grade 5 titanium implant with an SLA surface for enhanced osseointegration.",
            tags: ["Implant", "Titanium", "Surgery"],
            productionFlow: ["Machining", "Surface Treatment", "Sterilization"]
          },
          "DENT-F01-A4B2": {
            name: "Full Denture",
            description: "High-impact acrylic full denture with premium teeth.",
            tags: ["Removable Prosthesis", "Full Rehabilitation"],
            productionFlow: ["Modeling", "Articulation", "Acrylic Packing", "Polishing"]
          },
          "ALIGN-01-D6C3": {
            name: "Aligner Set",
            description: "Complete set of custom clear aligners for orthodontic treatment.",
            tags: ["Orthodontics", "Aesthetic", "Invisible"],
            productionFlow: ["Virtual Setup", "3D Printing", "Thermoforming", "Laser Trimming"]
          },
          "COMP-R01-E8D4": {
            name: "Composite Resin Kit",
            description: "Universal composite resin kit for anterior and posterior restorations.",
            tags: ["Restoration", "Clinical", "Material"],
            productionFlow: ["N/A"]
          },
          "PFM-C01-F2A5": {
            name: "PFM Crown",
            description: "Porcelain-fused-to-metal crown for a balance of strength and aesthetics.",
            tags: ["PFM", "Strength", "Traditional"],
            productionFlow: ["Metal Framework", "Porcelain Application", "Glaze"]
          },
          "CUST-ABUT-01-1B9F": {
            name: "Custom Abutment",
            description: "CAD/CAM custom abutment for a perfect implant restoration fit.",
            tags: ["Implant", "Implant Prosthesis", "CAD/CAM"],
            productionFlow: ["CAD Design", "CAM Machining", "Finishing"]
          },
          "SURG-G01-3C8E": {
            name: "Surgical Guide",
            description: "3D printed surgical guide for precise implant placement.",
            tags: ["Guided Surgery", "Implant", "3D Printing"],
            productionFlow: ["Planning", "3D Printing", "Post-processing"]
          },
          "NG-01-5E6D": {
            name: "Night Guard",
            description: "Custom-fit night guard for bruxism and clenching.",
            tags: ["Bruxism", "Occlusion", "Splint"],
            productionFlow: ["Modeling", "Vacuum Forming", "Adjustment & Polishing"]
          },
          "MB-01-7A4B": {
            name: "Maryland Bridge",
            description: "Resin-bonded bridge, a conservative option for replacing a single tooth.",
            tags: ["Fixed Prosthesis", "Adhesive", "Conservative"],
            productionFlow: ["CAD Design", "Milling", "Staining", "Glaze"]
          },
          "WAX-01-9D2C": {
            name: "Diagnostic Wax-Up",
            description: "Digital or analog diagnostic wax-up for treatment planning.",
            tags: ["Planning", "Diagnostic", "Aesthetic"],
            productionFlow: ["Scanning", "Digital Design", "3D Printing (Optional)"]
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
            },
            productsPage: {
                subtitle: "Explore nuestra selección completa de productos y servicios dentales digitales.",
                filters: "Filtros",
                priceRange: "Rango de Precios",
                loading: "Cargando productos...",
                noProductsFound: "No se encontraron productos",
                adjustFilters: "Ajusta los filtros para encontrar lo que buscas.",
            },
            productCard: {
                requiresUpload: "Subida obligatoria",
                code: "Código",
                noImage: "Sin imagen"
            }
        },
        product: {
            backToProducts: "Volver a los productos",
            code: "Código",
            deliveryTime: "Plazo de entrega estimado",
            days: "día(s)",
            customizeAndBuy: "Personalizar y Comprar",
            addToCart: "Añadir al Carrito",
            requiresStlUpload: "Se Requiere Subir Archivo STL",
            tags: "Indicaciones / tags",
            requiredFiles: "Archivos necesarios",
            optionalFiles: "Archivos opcionales",
            productionFlow: "Flujo de producción",
             modal: {
                title: "Personalice su Producto",
                step: "Paso {current} de {total}",
                steps: {
                    teeth: "Selección de Dientes",
                    color: "Color y Material",
                    files: "Subida de Archivos",
                    patient: "Ficha del Paciente",
                    review: "Revisión"
                },
                color: {
                    title: "SELECCIONE EL COLOR DESEADO"
                },
                files: {
                    title: "Subir Archivos Clínicos",
                    clickToUpload: "Haga clic para subir",
                    orDragAndDrop: "o arrastre y suelte",
                    fileTypes: "Archivos STL, PLY, OBJ (MÁX. 100MB)",
                    currentFile: "Archivo actual en el caso",
                    uploadToReplace: "Suba un nuevo archivo si desea reemplazarlo.",
                    uploadedFiles: "Archivos Subidos",
                },
                patient: {
                    title: "Ficha del Paciente",
                    name: "Nombre del Paciente",
                    age: "Edad",
                    clinicalNotes: "Observaciones Clínicas",
                    clinicalNotesPlaceholder: "Ej: Paciente con historial de bruxismo...",
                    dentistNotes: "Observaciones del Dentista",
                    dentistNotesPlaceholder: "Ej: Favor de revisar el punto de contacto...",
                },
                review: {
                    title: "Revise la información",
                    product: "Producto",
                    teeth: "Dientes",
                    none: "Ninguno",
                    color: "Color",
                    notSelected: "No seleccionado",
                    files: "Archivos",
                    newFiles: "nuevo(s)",
                    existingFile: "existente",
                    patient: "Paciente",
                    notInformed: "No informado",
                },
                buttons: {
                    back: "Volver",
                    next: "Siguiente",
                    addToCart: "Añadir al carrito"
                }
            }
        },
        footer: {
            tagline: "El futuro de la odontología digital, entregado en su clínica.",
            headings: {
                shop: "Tienda",
                company: "Empresa",
                account: "Cuenta"
            },
            links: {
                crowns: "Coronas y Puentes",
                implants: "Implantes",
                veneers: "Carillas",
                dentures: "Prótesis",
                about: "Sobre Nosotros",
                contact: "Contacto",
                shipping: "Política de Envío",
                privacy: "Política de Privacidad",
                myAccount: "Mi Cuenta",
                myOrders: "Mis Pedidos",
                login: "Iniciar Sesión",
                register: "Registrarse"
            },
            copyright: "Todos los derechos reservados."
        },
        products: {
          "ZIRC-001-C72B": {
            name: "Corona de Zirconio",
            description: "Corona de zirconio multicapa de alta translucidez, perfecta para resultados estéticos y funcionales.",
            tags: ["Estética", "Resistencia", "Coronas Unitarias"],
            productionFlow: ["Modelado", "Fresado", "Sinterización", "Acabado"]
          },
          "EMAX-V01-B5A1": {
            name: "Carilla E-Max",
            description: "Carilla de disilicato de litio para una estética máxima.",
            tags: ["Alta Estética", "Carillas", "Facetas"],
            productionFlow: ["Encerado", "Inyección", "Maquillaje", "Glaseado"]
          },
          "TI-IMP-001-9F3E": {
            name: "Implante de Titanio",
            description: "Implante de titanio Grado 5 con superficie SLA para una mejor osteointegración.",
            tags: ["Implante", "Titanio", "Cirugía"],
            productionFlow: ["Mecanizado", "Tratamiento de Superficie", "Esterilización"]
          },
          "DENT-F01-A4B2": {
            name: "Prótesis Completa",
            description: "Prótesis completa de acrílico de alto impacto con dientes de primera calidad.",
            tags: ["Prótesis Removible", "Rehabilitación Total"],
            productionFlow: ["Modelado", "Articulación", "Acrilado", "Pulido"]
          },
          "ALIGN-01-D6C3": {
            name: "Juego de Alineadores",
            description: "Juego completo de alineadores transparentes personalizados para tratamiento de ortodoncia.",
            tags: ["Ortodoncia", "Estética", "Invisible"],
            productionFlow: ["Setup Virtual", "Impresión 3D", "Termoformado", "Recorte Láser"]
          },
          "COMP-R01-E8D4": {
            name: "Kit de Resina Compuesta",
            description: "Kit de resina compuesta universal para restauraciones anteriores y posteriores.",
            tags: ["Restauración", "Clínica", "Material"],
            productionFlow: ["N/A"]
          },
          "PFM-C01-F2A5": {
            name: "Corona Metal-Cerámica",
            description: "Corona de porcelana fusionada a metal para un equilibrio entre resistencia y estética.",
            tags: ["PFM", "Resistencia", "Tradicional"],
            productionFlow: ["Estructura Metálica", "Aplicación de Porcelana", "Glaseado"]
          },
          "CUST-ABUT-01-1B9F": {
            name: "Pilar Personalizado",
            description: "Pilar personalizado en CAD/CAM para un ajuste perfecto de la restauración del implante.",
            tags: ["Implante", "Prótesis sobre Implante", "CAD/CAM"],
            productionFlow: ["Diseño CAD", "Mecanizado CAM", "Acabado"]
          },
          "SURG-G01-3C8E": {
            name: "Guía Quirúrgica",
            description: "Guía quirúrgica impresa en 3D para la colocación precisa de implantes.",
            tags: ["Cirugía Guiada", "Implante", "Impresión 3D"],
            productionFlow: ["Planificación", "Impresión 3D", "Post-procesado"]
          },
          "NG-01-5E6D": {
            name: "Férula de Descarga",
            description: "Férula de mordida personalizada para bruxismo y apretamiento.",
            tags: ["Bruxismo", "Oclusión", "Férula Miorrelajante"],
            productionFlow: ["Modelado", "Termoformado al Vacío", "Ajuste y Pulido"]
          },
          "MB-01-7A4B": {
            name: "Puente Maryland",
            description: "Puente adhesivo, una opción conservadora para reemplazar un solo diente.",
            tags: ["Prótesis Fija", "Adhesiva", "Conservador"],
            productionFlow: ["Diseño CAD", "Fresado", "Maquillaje", "Glaseado"]
          },
          "WAX-01-9D2C": {
            name: "Encerado Diagnóstico",
            description: "Encerado diagnóstico digital o analógico para la planificación del tratamiento.",
            tags: ["Planificación", "Diagnóstico", "Estética"],
            productionFlow: ["Escaneado", "Diseño Digital", "Impresión 3D (Opcional)"]
          }
        }
    }
};

export type Language = keyof typeof translations;
export type Namespace = keyof typeof translations[Language];
