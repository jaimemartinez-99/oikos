// Product families and recognisable brands, not supermarket SKUs. Keep ambiguous
// umbrella brands (Nestlé, Hacendado, Carrefour…) out: the product decides.
// Multiword names are important: e.g. leche corporal, bebida de avena, tomate frito.
export const shoppingCatalogue = {
  fruit: {
    products: `
      plátano|banana|banano|manzana|pera|naranja|mandarina|clementina|satsuma|limón|lima|
      pomelo|toronja|uva|fresa|fresón|frambuesa|arándano|mora|grosella|cereza|picota|
      melocotón|nectarina|paraguayo|platerina|albaricoque|ciruela|claudia|kiwi|kiwiño|
      piña|mango|papaya|aguacate|melón|sandía|coco|granada|higo|breva|caqui|kaki|
      persimón|chirimoya|níspero|maracuyá|fruta de la pasión|guayaba|lichi|litchi|
      pitaya|pitahaya|carambola|membrillo|fruta|frutos rojos|fruta del bosque|
      macedonia de fruta|ensalada de fruta|fruta congelada|fruta deshidratada|
      dátil|orejón|uva pasa|ciruela pasa|pasas|compota|puré de fruta
    `,
  },
  vegetables: {
    products: `
      verdura|hortaliza|tomate|tomate cherry|tomate pera|tomate raf|tomate rosa|
      tomate kumato|tomate seco|lechuga|cogollo|escarola|endibia|endivia|rúcula|
      canónigo|espinaca|acelga|borraja|berza|col|repollo|lombarda|coliflor|brócoli|
      bimi|romanesco|col de bruselas|kale|pak choi|bok choy|zanahoria|patata|papa|
      boniato|batata|yuca|chirivía|nabo|rábano|rabanito|remolacha|apio|apionabo|
      puerro|cebolla|cebolleta|chalota|ajo|ajete|ajo tierno|calabacín|calabaza|
      berenjena|pepino|pepinillo fresco|pimiento|pimiento verde|pimiento rojo|
      pimiento amarillo|pimiento de padrón|pimiento italiano|pimiento del piquillo|
      guindilla fresca|alcachofa|espárrago|judía verde|guisante|haba|tirabeque|
      edamame|maíz|mazorca|hinojo|cardo|champiñón|portobello|seta|boletus|
      shiitake|shimeji|níscalo|gírgola|trufa|brote de soja|germinado|ensalada|
      ensalada de bolsa|mezclum|menestra|menestra de verdura|verdura para wok|
      salteado de verdura|ensaladilla de verdura|pisto|acelga congelada
    `,
  },
  meat: {
    products: `
      carne|pollo|pechuga|pechuga de pollo|muslo|contramuslo|alita|jamoncito|
      solomillo|solomillo de pollo|pavo|pavita|ternera|vacuno|vaca|buey|añojo|
      novillo|cerdo|cochinillo|lechón|cordero|lechazo|cabrito|cabra|conejo|pato|
      codorniz|perdiz|faisán|ciervo|venado|jabalí|potro|caballo|avestruz|filete|
      bistec|bisté|entrecot|chuletón|chuleta|costilla|costillar|lomo|cinta de lomo|
      secreto|presa|pluma|aguja|redondo|rabillo|morcillo|osobuco|jarrete|carrillera|
      carrillada|falda|tapilla|babilla|tapa|espaldilla|paletilla|rabo de toro|
      carne picada|picada de ternera|picada mixta|hamburguesa|hamburguesa de pollo|albóndiga|pincho moruno|
      brocheta de carne|churrasco|panceta|tocino|bacon|beicon|bacón|jamón|jamón cocido|
      jamón serrano|jamón york|lacón|chorizo|chistorra|longaniza|salchicha|
      butifarra|morcilla|salchichón|fuet|salami|mortadela|cecina|sobrasada|
      embutido|fiambre|cabeza de jabalí|lomo embuchado|paté|foie|foie gras|
      hígado|riñón|molleja|callos|lengua de ternera|oreja de cerdo|manita de cerdo|
      hueso de jamón|hueso para caldo|carne para guisar|preparado de cocido
    `,
    brands: `ElPozo|El Pozo|Campofrío|Campofrio|Noel|Navidul|Casa Tarradellas fuet|
      Espuña|Joselito|Cinco Jotas|5 Jotas|Revilla|Argal|La Selva|Coren|Serrano jamón`,
  },
  fish: {
    products: `
      pescado|marisco|salmón|merluza|pescadilla|bacalao|atún|bonito|bonito del norte|
      sardina|sardinilla|boquerón|anchoa|caballa|verdel|jurel|chicharro|dorada|
      lubina|róbalo|rape|lenguado|gallo|rodaballo|fletán|halibut|trucha|salmonete|
      besugo|corvina|sargo|palometa|emperador|pez espada|cazón|tintorera|raya|
      carbonero|abadejo|brótola|maruca|chanquete|anguila|angula|gula|surimi|
      palito de cangrejo|calamar|chipirón|sepia|choco|pota|pulpo|anilla de calamar|
      mejillón|almeja|berberecho|navaja|coquina|chirla|vieira|zamburiña|ostra|
      gamba|gambón|langostino|carabinero|cigala|bogavante|langosta|buey de mar|
      centollo|nécora|cangrejo|percebe|camarón|quisquilla|hueva|caviar|
      preparado de marisco|preparado de paella|salpicón de marisco|tinta de calamar|
      pescado ahumado|salmón ahumado|bacalao desalado|filete de gallo|gallo de ración|
      gallo fresco|lomo de atún|lomo de salmón|hamburguesa de pescado|hamburguesa de salmón|
      ventresca|ventresca de atún|cocochas|kokotxas|kokotxas de bacalao|txipirón
    `,
    brands: `Pescanova|Findus pescado|La Gula del Norte|Angulas Aguinaga|Royal salmón|
      Calvo|Albo|Ortiz|Consorcio|Cuca|Rianxeira|Frinsa|Isabel|Isabel atún|Isabel bonito`,
  },
  dairy: {
    products: `
      leche|leche entera|leche semidesnatada|leche desnatada|leche sin lactosa|
      leche evaporada|leche condensada|leche en polvo|leche de cabra|leche de oveja|
      yogur|yogurt|yoghurt|yogur griego|yogur natural|yogur líquido|yogur bebible|
      yogur de soja|yogur vegetal|kéfir|kefir|skyr|quark|cuajada|requesón|queso|
      queso fresco|queso de untar|queso rallado|queso en lonchas|quesito|mozzarella|
      burrata|ricotta|mascarpone|parmesano|parmigiano|pecorino|grana padano|
      emmental|edam|gouda|cheddar|havarti|feta|brie|camembert|roquefort|
      gorgonzola|cabrales|manchego|tetilla|idiazábal|rulo de cabra|queso de cabra|
      mantequilla|margarina|nata|nata para montar|nata para cocinar|crema agria|
      crème fraîche|creme fraiche|buttermilk|suero de leche|huevo|clara de huevo|
      yema de huevo|huevo de codorniz|flan|natilla|arroz con leche|crema catalana|
      pudin|pudding|postre lácteo|batido de chocolate|batido de vainilla|
      batido de fresa|batido de proteína|batido proteico|petit suisse|petit suís
    `,
    brands: `Danone|Activia|Actimel|Danacol|Danonino|Danet|Oikos|Vitalínea|YoPRO|
      Philadelphia|Filadelfia queso|Babybel|Mini Babybel|La Vaca que Ríe|
      El Caserío|Kiri|Président|President|García Baquero|Flor de Esgueva|
      Boffard|Burgo de Arias|Angulo|Arla|Castello|Galbani|Zanetti|EntreMont|
      Puleva|Pascual|Central Lechera Asturiana|Asturiana|Kaiku|Celta leche|
      Larsa|Lauki|Letona|Clesa|Feiraco|Covap|Ato leche|Gaza leche|Lacturale|
      Río leche|Llet Nostra|Alpina yogur|La Lechera|Nestlé Gold flan|Reina flan|
      Dhul|Goshua|Granja San Francisco yogur|Pastoret|La Fageda|El Pastoret|
      Gervais|Petit Nestlé|Benecol|Flora|Tulipán|Lurpak|Kerrygold|Reny Picot|
      Chufi batido|Cacaolat|Puleva batido|Okey batido
    `,
  },
  grains: {
    products: `
      pan|pan de molde|pan integral|pan de pita|pan rallado|barra de pan|baguette|
      chapata|hogaza|mollete|bagel|brioche|biscote|tostada|picos|colines|regañá|
      grissini|rosquilleta|tortita de arroz|tortita de maíz|tortilla de trigo|
      tortilla de maíz|wrap|fajita|arepa|masa de pizza|masa de empanada|hojaldre|
      masa quebrada|pasta filo|oblea|arroz|arroz integral|arroz basmati|arroz jazmín|
      arroz bomba|arroz salvaje|arroz vaporizado|arroz de sushi|pasta|macarrón|
      espagueti|spaghetti|espaguetti|tallarín|fideo|vermicelli|noodle|ramen|
      udon|soba|penne|fusilli|hélice|farfalle|lazo de pasta|rigatoni|tortellini|
      ravioli|ñoqui|gnocchi|lasaña|placa de lasaña|canelón|sémola|cuscús|couscous|
      cous cous|bulgur|quinoa|quinua|avena|copo de avena|salvado|trigo|espelta|
      centeno|cebada|mijo|amaranto|sorgo|trigo sarraceno|alforfón|cereal|muesli|
      granola|corn flakes|copo de maíz|harina|harina de trigo|harina de maíz|
      harina de avena|harina de garbanzo|harina de arroz|maicena|almidón de maíz|
      fécula de patata|tapioca|levadura de panadería|levadura fresca|levadura seca|
      panecillo|hamburguesa pan|papel de arroz|pasta de lenteja|pasta de garbanzo|
      fideo de arroz|fideo de soja|galleta de arroz|ensalada de pasta|ensalada de arroz|
      ensalada de quinoa|tortita de avena|salvado de avena|salvado de trigo|
      germen de trigo|polenta|pasta de guisante|arroz redondo|arroz largo|
      arroz glutinoso|arroz arborio|arroz carnaroli|orzo|fregola|pasta de sopa
    `,
    brands: `Bimbo|Panrico|Silueta|Thins|Oroweat|Ortiz pan|Ortiz tostadas|Wasa|
      Schär|Schar|Proceli|Beiker|Gallo|Barilla|Garofalo|Rummo|De Cecco|
      Rana pasta|Giovanni Rana|La Molisana|Buitoni pasta|La Familia pasta|
      La Fallera|La Cigala|Brillante|SOS|SOS arroz|Nomen|Dacsa|Sundari|Brazal|
      Kellogg's|Kelloggs|Special K|All Bran|Weetabix|Quaker|Chocapic|Nesquik cereal|
      Choco Krispies|Corn Flakes|Fitness cereal|Chocoflakes|Maizena|Harimsa|
      Gallo harina|Santa Rita harina|Old El Paso tortilla|Mission wrap
    `,
  },
  legumes: {
    products: `
      legumbre|garbanzo|lenteja|lenteja pardina|lenteja roja|lenteja beluga|
      lenteja castellana|alubia|alubia blanca|alubia roja|alubia pinta|judía blanca|
      judía roja|judía pinta|judión|frijol|fréjol|poroto|habichuela|faba|fabes|
      soja|soja texturizada|soja en grano|altramuz|haba seca|guisante seco|
      garbanzo cocido|lenteja cocida|alubia cocida|bote de garbanzo|tofu|tempeh
    `,
    brands: `Luengo|Litoral fabada|Litoral lentejas|Litoral cocido|El Hostal|
      La Asturiana legumbres|Pedrosillano|La Cochura|Ja'e garbanzos|Jae garbanzos`,
  },
  drinks: {
    products: `
      bebida|agua|agua mineral|agua con gas|agua sin gas|agua de coco|agua tónica|
      refresco|gaseosa|soda|tónica|cola|cola zero|cola light|limonada|naranjada|
      zumo|jugo|néctar|néctar de fruta|mosto|smoothie|granizado|horchata|
      bebida vegetal|bebida de avena|bebida de soja|bebida de almendra|
      bebida de arroz|bebida de coco|leche de avena|leche de soja|leche de almendra|
      leche de arroz|leche de coco|café|café molido|café en grano|café soluble|
      café descafeinado|cápsula de café|cápsula dolce gusto|cápsula nespresso|
      té|te verde|te negro|te rojo|te blanco|matcha|chai|infusión|manzanilla|
      tila|rooibos|poleo|poleo menta|hierbaluisa|mate|hibisco|cerveza|birra|
      cerveza sin alcohol|cerveza 0 0|clara de limón|sidra|vino|vino tinto|
      vino blanco|vino rosado|cava|champán|champagne|espumoso|vermut|vermú|
      sangría|tinto de verano|licor|ginebra|gin|ron|whisky|whiskey|vodka|
      tequila|brandy|coñac|cognac|orujo|anís|pacharán|amaretto|spritz|
      bebida energética|bebida isotónica|suero oral|kombucha|kéfir de agua|
      batido vegetal|agua saborizada|vino para cocinar|cacao soluble
    `,
    brands: `Coca Cola|Cocacola|Pepsi|Fanta|Sprite|7 Up|Seven Up|Schweppes|
      La Casera|Kas|Trina|Aquarius|Nestea|Fuze Tea|Lipton|Bitter Kas|Powerade|
      Gatorade|Red Bull|Redbull|Monster|Burn|Rockstar|Reign|Prime bebida|
      Solán de Cabras|Solan|Bezoya|Font Vella|Lanjarón|Lanjaron|Aquabona|
      Bronchales|Cabreiroá|Viladrau|Vichy Catalán|Perrier|San Pellegrino|
      Sant Aniol|Font d'Or|Evian|Sousas|Mondariz|Veri|Fuente Liviana|
      Granini|Don Simón|Don Simon|Juver|Pago zumo|Sunny Delight|Capri Sun|
      Alpro|Yosoy|Oatly|Vivesoy|Gerblé bebida|Chufi|Nescafé|Nescafe|
      Nespresso|Dolce Gusto|Marcilla|Bonka|Saimaza|L'Or|L or café|Lavazza|
      Illy|Saula|Delta café|Candelas|Fortaleza café|Baqué|Dromedario|Tassimo|
      Hornimans|Pompadour|Yogi Tea|Twinings|Té Meßmer|Cola Cao|Colacao|Nesquik|
      Valor cacao|Mahou|San Miguel|Estrella Galicia|Estrella Damm|Voll Damm|
      Free Damm|Heineken|Amstel|Cruzcampo|Alhambra|Águila cerveza|El Águila|
      Keler|Victoria cerveza|Turia|Moritz|Budweiser|Guinness|Corona|Coronita|
      Desperados|Leffe|Paulaner|Franziskaner|Peroni|Brewdog|1906 cerveza|
      El Gaitero|Ladrón de Manzanas|La Tita|La Guita|Tío Pepe|Marqués de Cáceres|
      Marqués de Riscal|Ramón Bilbao|Protos|Cune|Viña Pomal|Campo Viejo|Faustino|
      Freixenet|Codorníu|Juve Camps|Martini|Cinzano|Yzaguirre|Aperol|Campari|
      Beefeater|Tanqueray|Bombay Sapphire|Larios|Puerto de Indias|Seagram's|
      Barceló|Brugal|Bacardí|Havana Club|Captain Morgan|Cacique ron|Pampero|
      DYC|J&B|JB whisky|Ballantine's|Johnnie Walker|Jack Daniel's|Jameson|
      Absolut|Smirnoff|Baileys|Malibú|Ruavieja|Jägermeister|Licor 43
    `,
  },
  household: {
    products: `
      limpieza|limpiador|limpiacristales|limpia cristales|limpiamuebles|
      limpiacocinas|limpia cocina|limpia horno|limpiahornos|limpiabaños|
      limpia baño|limpia inodoro|fregasuelos|friegasuelos|lejía|amoniaco|
      desinfectante|desengrasante|antical|antigrasa|quitagrasas|quitamanchas|
      detergente|suavizante|lavavajillas|lavaplatos|abrillantador|sal lavavajillas|sal para lavavajillas|
      gel lavavajillas|gel para lavavajillas|gel de lavavajillas|
      sal de lavavajillas|pastilla lavavajillas|pastilla para lavavajillas|
      cápsula de detergente|cápsula de lavavajillas|jabón de platos|
      jabón para ropa|jabón de marsella|jabón lagarto|jabón potásico|
      vinagre de limpieza|bicarbonato de limpieza|alcohol de limpieza|
      alcohol de quemar|agua destilada|agua desionizada|agua para plancha|
      percarbonato|sosa cáustica|desatascador|deshollinador|cera para suelo|
      limpiador de vitro|limpiador de acero|limpiador multiusos|multiusos|
      papel de cocina|rollo de cocina|servilleta|pañuelo de papel|kleenex|
      papel de aluminio|papel aluminio|papel de horno|papel para horno|papel vegetal|papel film|
      film transparente|film alimentario|bolsa de basura|bolsa basura|
      bolsa de congelación|bolsa congelación|bolsa hermética|bolsa de bocadillo|
      bolsa zip|bolsa para alimentos|bolsa de aspiradora|filtro de café|
      estropajo|esponja de cocina|bayeta|paño de cocina|trapo|microfibra|
      guante de limpieza|guante de fregar|guante de goma|guante de nitrilo|
      fregona|recambio de fregona|mopa|recambio de mopa|escoba|recogedor|
      cepillo de limpieza|escobilla|cubo de fregar|tendedero|pinza de ropa|
      percha|ambientador|vela aromática|mikado ambientador|insecticida|
      antimosquitos|repelente de mosquitos|antipolillas|trampa de hormigas|
      pilas|pila alcalina|batería|bombilla|cerilla|mechero|encendedor|
      carbón de barbacoa|pastilla de encendido|palillo|brocheta de madera|
      vaso desechable|plato desechable|cubierto desechable|pajita|táper|
      tupper|táper de plástico|recipiente hermético|bolsa isotérmica|
      comida para perro|pienso|comida para gato|arena de gato|arena para gato|
      lata para gato|lata para perro|snack para perro|snack para gato|
      papel absorbente|quitapelusas|rodillo adhesivo|bolsa de hielo
    `,
    brands: `Fairy|Mistol|KH7|KH 7|KH-7|Sanytol|Ariel|Skip|Wipp|Wipp Express|
      Dixan|Persil|Flota|Elena detergente|Colon|Colón|Norit|Perlán|Perlan|
      Lenor|Mimosín|Mimosin|Flor suavizante|Vernel|Asevi|Don Limpio|Mr Proper|
      Tenn|Estrella lejía|Conejo lejía|Neutrex|Volvone|Viakal|Cillit Bang|
      Cilit Bang|Bosque Verde|Zas limpiador|Sanicentro|Las 3 Brujas|Bruguer|
      Frosch|Ecover|Lagarto|Chimbo|Beltrán jabón|Finish|Calgonit|Somat|
      Calgon|Vanish|Kalia|Oxi Action|Dr Beckmann|Dr. Beckmann|Vileda|
      Spontex|Scotch Brite|Scotchbrite|Bayeco|Ballerina bayeta|Scrub Daddy|
      Albal|Bosque Verde bolsas|Ziploc|Scottex|Colhogar|Renova|Foxy|
      Scotty|Kleenex|Tempo pañuelos|Tork|Regina papel|Pétalo papel|
      Air Wick|Airwick|Ambipur|Ambi Pur|Glade|Brise|Febreze|Bref|Pato WC|
      WC Net|Duck WC|Bloom|Raid|Orion|Autan|Fogo|Baygon|Zum insecticida|
      Cucal|Polil|Compo insecticida|Duracell|Energizer|Varta|Cegasa|
      Pedigree|Royal Canin|Ultima pienso|Affinity pienso|Brekkies|Friskies|
      Whiskas|Purina|Felix gato|Gourmet gato|Sheba|Cesar perro|Cat's Best
    `,
  },
  hygiene: {
    products: `
      higiene|champú|champu|shampoo|acondicionador|mascarilla capilar|
      gel|gel de ducha|gel de baño|gel de manos|gel íntimo|gel hidroalcohólico|
      jabón de manos|jabón de tocador|jabón corporal|jabón íntimo|
      jabón facial|pastilla de jabón|espuma de baño|sales de baño|
      desodorante|antitranspirante|colonia|perfume|agua de colonia|
      crema corporal|leche corporal|leche hidratante|body milk|bodymilk|
      crema hidratante|crema facial|crema de manos|crema de pies|
      crema solar|protector solar|protección solar|after sun|aftersun|
      aceite corporal|aceite de ducha|aceite esencial|aceite de bebé|
      aceite de masaje|vaselina|bálsamo labial|cacao labial|protector labial|
      cacao de labios|crema de cacao labial|pasta de dientes|pasta dental|
      dentífrico|dentifrico|cepillo de dientes|cepillo dental|colutorio|
      enjuague bucal|hilo dental|seda dental|cepillo interdental|
      limpiador facial|limpiador íntimo|agua micelar|agua oxigenada|
      agua de rosas|agua termal|agua de colonia|tónico facial|
      desmaquillante|disco desmaquillante|algodón|bastoncillo|
      pañal|pañal de bebé|toallita|toallita de bebé|compresa|tampón|
      salvaslip|protegeslip|copa menstrual|papel higiénico|papel wc|
      papel de baño|rollo de papel higiénico|rollo higiénico|
      maquinilla|cuchilla de afeitar|espuma de afeitar|gel de afeitar|
      after shave|aftershave|bálsamo de afeitar|cera depilatoria|
      crema depilatoria|banda depilatoria|tinte|laca|gomina|
      cera capilar|espuma capilar|sérum|serum|mascarilla facial|
      esmalte de uñas|quitaesmalte|lima de uñas|cortaúñas|peine|
      cepillo de pelo|preservativo|condón|lubricante íntimo|
      suero fisiológico|tirita|apósito|gasa|venda|esparadrapo|
      termómetro|test de embarazo|mascarilla quirúrgica|
      solución de lentillas|líquido de lentillas|talco|crema de pañal|
      jabón de ducha|jabón de baño|crema antiestrías|crema antiedad|
      contorno de ojos|protector térmico|sérum capilar|tónico capilar|
      bálsamo de labios|protector de labios|crema de cacao para labios
    `,
    brands: `H&S|H S|HS champú|Head Shoulders|Head and Shoulders|Pantene|
      Elvive|Fructis|Garnier|Tresemmé|Tresemme|Timotei|Herbal Essences|
      Schwarzkopf|Gliss|Syoss|Aussie|Nuggela|OGX|Hidrogenesse|Sanex|
      Dove|Lactovit|Moussel|Magno|La Toja|Natural Honey|Instituto Español|
      Tulipán Negro|Fa gel|Palmolive|Nivea|Nivea Men|Neutrogena|
      Eucerin|Isdin|Bioderma|La Roche Posay|Cerave|Cera Ve|Avène|Avene|
      Babaria|Deliplus|Byphasse|Ziaja|Sebamed|Aderma|A Derma|Mixa|
      Rexona|Axe|Old Spice|Dove Men|Williams|Vichy desodorante|
      Adidas desodorante|Mum desodorante|Denenes|Nenuco|Mustela|
      Johnson's Baby|Johnsons Baby|Suavinex|Chicco pañales|Dodot|
      Huggies|Pampers|Chelino|Moltex|Lillydoo|DryNites|Ausonia|
      Evax|Tampax|OB tampones|O B tampones|Carefree|Tena|Indasec|
      Colgate|Oral B|OralB|Oral-B|Sensodyne|Binaca|Signal|Licor del Polo|
      Parodontax|Vitis|Lacer|Kin dentífrico|Fluocaril|Elmex|Bexident|
      Listerine|Parogencyl|Corega|Kukident|Fixodent|Interprox|
      Gillette|Wilkinson|Bic maquinillas|Venus cuchillas|Veet|
      Taky|Depiwell|Durex|Control preservativos|Hansaplast|Compeed|
      Cristalmina|Betadine|Salvelox|Alvita gasas|Batiste|Revlon tinte|
      Llongueras|L'Oreal tinte|Just For Men|Taft|Nelly laca|Elnett
    `,
  },
  other: {
    products: `
      hummus|humus|houmous|guacamole|tzatziki|mutabal|baba ganoush|tapenade|
      paté vegetal|paté de aceituna|paté de berenjena|crema de cacahuete|
      crema de almendra|crema de avellana|crema de pistacho|mantequilla de cacahuete|
      manteca de cacahuete|aceite|aceite de oliva|aceite de girasol|aceite de coco|
      aceite de sésamo|aceite de aguacate|aceite de colza|aceite de orujo|aove|
      vinagre|vinagre balsámico|vinagre de manzana|vinagre de vino|vinagre de arroz|
      sal|sal fina|sal gorda|sal en escamas|sal de ajo|sal marina|sal rosa|
      azúcar|azúcar moreno|azúcar glas|panela|edulcorante|sacarina|estevia|
      stevia|eritritol|xilitol|miel|sirope|melaza|agave|sirope de arce|
      especia|condimento|pimienta|pimentón|comino|cúrcuma|curry|canela|
      clavo|nuez moscada|azafrán|jengibre|vainilla|orégano|albahaca|
      perejil|cilantro|tomillo|romero|laurel|eneldo|menta|hierbabuena|
      estragón|salvia|cebollino|cardamomo|cayena|chile|guindilla|
      ajo en polvo|cebolla en polvo|jengibre molido|pimentón de la vera|
      sazonador|sazonador de pollo|sazonador de carne|sazonador de pescado|
      caldo|caldo de pollo|caldo de carne|caldo de pescado|caldo de verdura|
      pastilla de caldo|sopa|sopa de pollo|sopa de pescado|sopa de verdura|
      crema de verdura|crema de calabaza|crema de calabacín|crema de champiñón|
      gazpacho|salmorejo|salsa|salsa de soja|salsa de tomate|tomate frito|
      tomate triturado|tomate natural triturado|tomate concentrado|puré de tomate|passata|kétchup|ketchup|
      mayonesa|mahonesa|mostaza|alioli|all i oli|pesto|salsa barbacoa|salsa bbq|
      salsa brava|salsa rosa|salsa césar|salsa teriyaki|salsa sriracha|
      salsa tabasco|salsa picante|salsa bechamel|salsa boloñesa|salsa carbonara|
      salsa curry|salsa de yogur|salsa de queso|sofrito|salsa mexicana|
      leche de coco para cocinar|nata vegetal para cocinar|crema de coco|
      aceituna|oliva|encurtido|pepinillo|alcaparra|banderilla|cebollita en vinagre|
      patata frita|patata chips|patata de bolsa|patatas fritas|chips|nacho|
      tortilla chip|aperitivo|snack|palomita|gusanito|corteza|torrezno|
      fruto seco|almendra|nuez|avellana|cacahuete|pistacho|anacardo|piñón|
      pipa|pipa de girasol|semilla|semilla de chía|semilla de lino|sésamo|
      tahini|tahín|crema de sésamo|mezcla de frutos secos|
      galleta|galleta maría|galleta de chocolate|galleta de avena|cookie|
      barquillo|bizcocho|magdalena|croissant|cruasán|napolitana|ensaimada|
      sobao|bollo|bollería|donut|dónut|berlina|palmera|gofre|tortita dulce|
      crepe|churro|porra|pastel|tarta|muffin|brownie|pastelito|brazo de gitano|
      chocolate|chocolatina|bombón|trufa de chocolate|cacao|cacao en polvo|
      crema de cacao|crema de chocolate|huevo de chocolate|huevo kinder|
      mermelada|confitura|dulce de leche|caramelo|chuche|gominola|golosina|
      chicle|regaliz|turrón|mazapán|polvorón|mantecado|peladilla|
      helado|polo de helado|sorbete|tarta helada|granizado de helado|
      gelatina|levadura química|impulsor|gasificante|bicarbonato|
      chocolate de cobertura|pepita de chocolate|fideo de chocolate|
      colorante alimentario|aroma de vainilla|coco rallado|
      pizza|pizza de jamón|pizza de atún|empanada|empanadilla|croqueta|
      croqueta de pollo|croqueta de jamón|croqueta de bacalao|nugget|
      san jacobo|cordon bleu|flamenquín|cachopo|tortilla de patata|
      tortilla española|ensaladilla rusa|paella preparada|arroz preparado|
      hamburguesa vegetal|hamburguesa de soja|hamburguesa de garbanzo|
      salchicha vegetal|albóndiga vegetal|falafel|seitán|heura|
      canelón preparado|lasaña preparada|plato preparado|comida preparada|
      sushi|maki|sashimi|gyoza|dim sum|rollito de primavera|bao|
      alga|nori|wakame|kombu|agar agar|levadura nutricional|proteína en polvo|
      colágeno|suplemento|vitamina|creatina|papilla|potito|leche infantil|
      leche de fórmula|cereal infantil|puré de bebé
    `,
    brands: `Heinz|Hellmann's|Hellmanns|Ybarra|Choví|Chovi|Ligeresa|Musa mayonesa|
      Prima ketchup|Orlando|Solís|Solis|Hida|Apis tomate|Mutti|Gvtarra|
      Knorr|Avecrem|Gallina Blanca|Aneto|Maggi|Starlux|Ducros|Carmencita|
      Tabasco|Sriracha|Kikkoman|Lea Perrins|Perrins|Borges|Carbonell|Koipe|
      La Española aceite|La Masía|Coosur|Hojiblanca|La Chinata|Ybarra aceite|
      Bertolli|Oro Bailén|Oleoestepa|Dcoop|Fragata|Serpis|Jolca|La Explanada|
      La Vieja Fábrica|Hero mermelada|Helios|Bebé mermelada|St Dalfour|
      Nocilla|Nutella|Milka|Lindt|Toblerone|Ferrero|Kinder|Kit Kat|Kitkat|
      Crunch chocolate|Nestlé chocolate|Valor chocolate|Huesitos|Twix|Mars|
      Snickers|Bounty|M&M's|M M s|Lacasitos|Conguitos|Maltesers|After Eight|
      Oreo|Príncipe|Principe|Chips Ahoy|Chiquilín|Chiquilin|Fontaneda|
      Cuétara|Cuetara|Gullón|Gullon|Artiach|Marbú|Marbu|Tosta Rica|Tostarica|
      Dinosaurus|María galletas|Lotus|Digestive|Belvita|Napolitanas galletas|
      Donuts|Donettes|Bollycao|Phoskitos|La Bella Easo|Martínez bollería|
      Dulcesol|Codan|La Granja magdalenas|Bony|Tigretón|Pantera Rosa|
      Lay's|Lays|Ruffles|Doritos|Cheetos|Fritos|Matutano|Pringles|
      Risi|Grefusa|Gublins|Risketos|Triskys|Snatt's|Snatts|Frit Ravich|
      El Valle patatas|Santa Ana patatas|Facundo|Eagle frutos secos|
      Pipas G|Tijuana pipas|MisterCorn|Mister Corn|Borges frutos secos|
      Haribo|Fini|Vidal golosinas|Chupa Chups|Chupachups|Sugus|Mentolin|
      Halls|Trident|Orbit|Smint|Fisherman's Friend|Ricola|
      Magnum|Cornetto|Calippo|Frigo|Häagen Dazs|Haagen Dazs|Ben Jerry's|
      Ben and Jerry's|Carte d'Or|Carte Dor|La Menorquina|Farggi|Kalise|
      Alacant helado|Royne|Sandwiche helado|Dr Oetker|Dr. Oetker|
      Royal levadura|Royal gelatina|Royal flan|Vahiné|Vahine|Mandarín flan|
      Telepizza|Casa Tarradellas|Campofrío pizza|Buitoni pizza|Ristorante|
      La Cocinera|Maheso|Fripozo|Findus|Dani conserva|Carretilla|Litoral|
      Heura|Garden Gourmet|Beyond Meat|Violife|Gerblé galletas|
      Naturnes|Hero Baby|Nutribén|Nutriben|Blemil|Almirón|Almiron|Aptamil|
      Nidina|Nativa leche infantil|Enfamil|Damira|Smileat|Yammy potitos
    `,
  },
};
