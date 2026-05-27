/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ComponentBlock, TransversalBlock, Threat, PONFlow } from './types';

export const COMPONENT_BLOCKS: ComponentBlock[] = [
  {
    id: 'Personas',
    name: 'Vulnerabilidad en Personas',
    items: [
      {
        id: 'P_Organizacion',
        name: 'Organización',
        description: 'Estructura organizativa, comités de emergencia, brigadas y asignación presupuestal.',
        questions: [
          {
            id: 'p_org_q1',
            text: '¿Existe un Comité Operativo de Emergencias (COE) conformado y con roles asignados por escrito?',
            recommendation: 'Conformar el COE mediante acta de gerencia, definiendo líder, enlace y responsabilidades ante emergencias.',
          },
          {
            id: 'p_org_q2',
            text: '¿Se cuenta con una Brigada de Emergencia debidamente seleccionada, entrenada y estructurada?',
            recommendation: 'Elegir personal apto físicamente y capacitarlo legalmente. Nombrar jefe de brigada y coordinadores de evacuación.',
          },
          {
            id: 'p_org_q3',
            text: '¿Se cuenta con un presupuesto anual asignado y aprobado específicamente para el plan de prevención y emergencias?',
            recommendation: 'Asignar rubro presupuestal anual certificado para la compra de suministros, recargas de extintores y capacitación.',
          }
        ]
      },
      {
        id: 'P_Capacitacion',
        name: 'Capacitación',
        description: 'Capacitación teórico-práctica del personal, formación a la brigada y divulgación general.',
        questions: [
          {
            id: 'p_cap_q1',
            text: '¿Existe un plan formativo teórico-práctico anual para el personal general, contratistas y brigadistas?',
            recommendation: 'Elaborar un cronograma anual que abarque inducción de emergencias a nuevos ingresos y reentrenamiento a antiguos.',
          },
          {
            id: 'p_cap_q2',
            text: '¿Se cuenta con entrenamiento técnico específico para la brigada en rescate, primeros auxilios y control de incendios?',
            recommendation: 'Garantizar prácticas presenciales certificadas con bomberos u organismos de socorro especializados.',
          },
          {
            id: 'p_cap_q3',
            text: '¿Se realizan campañas de divulgación periódica del plan de emergencias, mapas y puntos de encuentro a los colaboradores?',
            recommendation: 'Utilizar correos informativos, carteleras, folletos y charlas de 5 minutos sobre rutas y puntos de encuentro.',
          }
        ]
      },
      {
        id: 'P_Dotacion',
        name: 'Dotación',
        description: 'Equipos de Protección Personal, realización de simulacros organizados y sistemas de comunicación.',
        questions: [
          {
            id: 'p_dot_q1',
            text: '¿Los integrantes de la brigada cuentan con Equipos de Protección Personal (EPP) completos, normados e idóneos?',
            recommendation: 'Suministrar cascos, guantes, googles, chalecos reflectivos de alta visibilidad y botas de seguridad a toda la brigada.',
          },
          {
            id: 'p_dot_q2',
            text: '¿Se realizan simulacros de evacuación planificados (mínimo 1 anual por ley) con evaluación formal de tiempos de respuesta?',
            recommendation: 'Programar, ejecutar y redactar el informe técnico del simulacro nacional anual, midiendo tiempos con cronómetro.',
          },
          {
            id: 'p_dot_q3',
            text: '¿La organización dispone de sistemas de comunicación de emergencias idóneos (radios bidireccionales, megáfonos, alarmas)?',
            recommendation: 'Adquirir al menos un megáfono portátil, radios con frecuencia reservada y un sistema sonoro audible en toda la instalación.',
          }
        ]
      }
    ]
  },
  {
    id: 'Recursos',
    name: 'Vulnerabilidad en Recursos',
    items: [
      {
        id: 'R_Materiales',
        name: 'Materiales',
        description: 'Clasificación de botiquines, camillas de respuesta, y kits especiales para control de eventos.',
        questions: [
          {
            id: 'r_mat_q1',
            text: '¿Se cuenta con botiquines de primeros auxilios debidamente dotados, vigentes e inspeccionados según la norma local?',
            recommendation: 'Sellar los botiquines, inventariar mensualmente los insumos (suero, gasas, vendas, etc.) y descartar elementos vencidos.',
          },
          {
            id: 'r_mat_q2',
            text: '¿Se dispone de camillas de emergencia con inmovilizadores y correas de sujeción (araña) distribuidas estratégicamente?',
            recommendation: 'Instalar camillas rígidas naranjas en la pared, con sus respectivos inmovilizadores de cuello y correas correspondientes.',
          },
          {
            id: 'r_mat_q3',
            text: '¿Se cuenta con kits para derrames químicos, biológicos o tecnológicos completos (absorbentes, diques, bolsas rojas)?',
            recommendation: 'Adquirir kits de derrames en puntos de almacenamiento de químicos con aserrín neutralizante, paños absorbentes y pica/pala plástica.',
          }
        ]
      },
      {
        id: 'R_Infraestructura',
        name: 'Infraestructura',
        description: 'Ubicación y estado de rutas de evacuación, sismorresistencia del predio y diseño seguro de escaleras.',
        questions: [
          {
            id: 'r_inf_q1',
            text: '¿Las rutas de evacuación, salidas de emergencia y pasillos están despejados, señalizados e iluminados autónomamente?',
            recommendation: 'Garantizar que no existan mercancías obstruyendo pasillos. Instalar lámparas de emergencia con baterías de respaldo autónomo.',
          },
          {
            id: 'r_inf_q2',
            text: '¿La estructura de la edificación cuenta con concepto técnico de sismorresistencia (NSR-10) o reforzamiento estructural?',
            recommendation: 'Contratar una firma de ingeniería civil para adelantar estudio técnico analítico y emitir concepto técnico de sismicidad estructural.',
          },
          {
            id: 'r_inf_q3',
            text: '¿Las escaleras de contra incendios cuentan con pasamanos continuos, cintas antideslizantes de alta tracción y material ignífugo?',
            recommendation: 'Fijar pasamanos laterales robustos y reemplazar cintas de lija desgastadas en cantos de escaleras para evitar caídas severas.',
          }
        ]
      },
      {
        id: 'R_Equipos',
        name: 'Equipos',
        description: 'Capacidad extintora portátil, detección automatizada de incendios y sistemas fijos de extinción.',
        questions: [
          {
            id: 'r_equ_q1',
            text: '¿Se cuenta con extintores portátiles multipropósito vigentes, anclados a altura reglamentaria, señalizados e inspeccionados?',
            recommendation: 'Realizar inspección mensual visual de presión en manómetro. Programar recarga anual obligatoria e instalarlos a 1.2 o 1.5 metros.',
          },
          {
            id: 'r_equ_q2',
            text: '¿La instalación cuenta con un sistema electrónico de detección de humo, calor o gas completamente funcional y centralizado?',
            recommendation: 'Instalar panel de alarma centralizado conectado a detectores fotoeléctricos con mantenimiento preventivo semestral.',
          },
          {
            id: 'r_equ_q3',
            text: '¿Existen sistemas fijos de extinción de incendios (gabinetes equipados con manguera, rociadores automáticos) certificados?',
            recommendation: 'Verificar la presión del sistema hidroneumático de la red contra incendio y capacitar al personal pesado en el despliegue de mangueras.',
          }
        ]
      }
    ]
  },
  {
    id: 'Sistemas',
    name: 'Vulnerabilidad en Sistemas y Procesos',
    items: [
      {
        id: 'S_Servicios',
        name: 'Servicios Públicos',
        description: 'Integridad de los servicios de energía, redes hidrosanitarias y seguridad del gas natural/propano.',
        questions: [
          {
            id: 's_ser_q1',
            text: '¿El suministro de energía eléctrica posee cableado en buen estado, cajas tabuladas rotuladas e inspecciones termográficas?',
            recommendation: 'Inspeccionar cableado expuesto. Mantener cerradas y rotuladas las puertas de tableros eléctricos bajo norma RETIE.',
          },
          {
            id: 's_ser_q2',
            text: '¿Se cuenta con servicios independientes de agua potable y alcantarillado con mantenimiento sistemático preventivo?',
            recommendation: 'Limpiar trampas de grasas e inspeccionar cajas de inspección sanitaria cada semestre para evitar reflujo por lluvias.',
          },
          {
            id: 's_ser_q3',
            text: '¿Las redes de gas natural o propano se encuentran certificadas bajo norma, con tuberías pintadas de amarillo y válvula rápida exterior?',
            recommendation: 'Instalar válvula de paso rápido exterior marcada con rótulo de emergencia para cierre inmediato en caso de sismo.',
          }
        ]
      },
      {
        id: 'S_Alternos',
        name: 'Sistemas Alternos',
        description: 'Suministro alterno de agua, generación de potencia de respaldo y resguardo de datos.',
        questions: [
          {
            id: 's_alt_q1',
            text: '¿Dispone la empresa de tanques de reserva de agua con capacidad autónoma calculada para abastecimiento ante cortes prolongados?',
            recommendation: 'Calcular el consumo diario por colaborador y realizar lavado/desinfección semestral obligatoria de tanques de acumulación.',
          },
          {
            id: 's_alt_q2',
            text: '¿Se cuenta con una planta eléctrica de emergencia operativa, con transferencia automática y reserva de combustible segura?',
            recommendation: 'Garantizar el arranque de prueba semanal bajo carga de la planta y almacenar el ACPM en diques metálicos antichispas.',
          },
          {
            id: 's_alt_q3',
            text: '¿Se tienen respaldos (backups) diarios automatizados de información crítica del negocio almacenados fuera de la sede?',
            recommendation: 'Configurar sincronización en nube cifrada o almacenar copias de seguridad físicas en una caja de seguridad remota externa.',
          }
        ]
      },
      {
        id: 'S_Recuperacion',
        name: 'Sistemas de Recuperación',
        description: 'Suscripción de pólizas ante catástrofe, convenios críticos de soporte y continuidad del negocio.',
        questions: [
          {
            id: 's_rec_q1',
            text: '¿Se encuentra suscrita y plenamente vigente la Póliza de Seguros Todo Riesgo con cobertura explícita de desastres naturales?',
            recommendation: 'Revisar anualmente los montos asegurados de activos fijos y verificar que cubra terremoto, asonada e inundaciones.',
          },
          {
            id: 's_rec_q2',
            text: '¿Se tienen convenios o contratos de emergencia vigentes con proveedores claves de agua, alimentos, maquinaria y salud?',
            recommendation: 'Firmar acuerdos de niveles de servicio (SLA) con clínicas cercanas y distribuidores rápidos de suministros de crisis.',
          },
          {
            id: 's_rec_q3',
            text: '¿Se cuenta con un Plan de Continuidad del Negocio (BCP) documentado, socializado y aprobado formalmente por la gerencia?',
            recommendation: 'Definir el RTO (Tiempo de Recuperación Objetivo) y designar puestos de trabajo alternos para la continuidad de la operación.',
          }
        ]
      }
    ]
  }
];

export const TRANSVERSAL_BLOCKS: TransversalBlock[] = [
  {
    id: 'PESV',
    name: 'Plan Estratégico de Seguridad Vial (PESV)',
    lawReference: 'Resolución 20223040040595 de 2022 (Colombia)',
    description: 'Gestión de riesgos en la vía para empresas con flota de vehículos o trabajadores misionales de conducción.',
    questions: [
      {
        id: 'pesv_q1',
        text: '¿Se cuenta con un diagnóstico detallado de riesgos viales y caracterización sociodemográfica de todos los conductores?',
        recommendation: 'Aplicar encuestas viales para identificar hábitos, horarios de conducción, estado de licencias y perfiles de riesgo.',
      },
      {
        id: 'pesv_q2',
        text: '¿Se realizan y registran de forma obligatoria las inspecciones preoperacionales a todos los vehículos antes de cada jornada?',
        recommendation: 'Digitalizar o archivar daily checklists que evalúen frenos, llantas, fluidos y sistemas de luces de forma estricta.',
      },
      {
        id: 'pesv_q3',
        text: '¿El personal motorizado o conductor posee certificaciones vigentes en cursos de manejo defensivo y seguridad vial?',
        recommendation: 'Programar reentrenamiento de manejo defensivo con proveedores autorizados y evaluar de forma teórica a los actores.',
      },
      {
        id: 'pesv_q4',
        text: '¿El PESV se encuentra implementado bajo la estructura normativa vigente y articulado con el SGSST de la empresa?',
        recommendation: 'Integrar los comités de seguridad vial con el COPASST y realizar auditoría interna del PESV por lo menos una vez al año.',
      }
    ]
  },
  {
    id: 'Psicosocial',
    name: 'Riesgo Psicosocial y Salud Mental',
    lawReference: 'Resolución 2764 de 2022 y Ley 1010 de 2006 (Colombia)',
    description: 'Control de fatiga, prevención del estrés e idoneidad del Comité de Convivencia Laboral.',
    questions: [
      {
        id: 'psico_q1',
        text: '¿Se aplica la Batería oficial de Riesgo Psicosocial de forma anual por un psicólogo titulado con licencia en SST vigente?',
        recommendation: 'Contratar psicólogo especialista para administrar el cuestionario del Ministerio de Trabajo y emitir informe de recomendaciones.',
      },
      {
        id: 'psico_q2',
        text: '¿El Comité de Convivencia Laboral (COCOLA) se encuentra constituido de forma de paridad, activo y con actas de reunión trimestrales?',
        recommendation: 'Realizar votación de representantes del empleador y trabajadores. Archivar confidencialmente los casos radicados.',
      },
      {
        id: 'psico_q3',
        text: '¿Dispone la empresa de una ruta de atención, protocolo o línea de primeros auxilios psicológicos ante crisis de salud de colaboradores?',
        recommendation: 'Crear folleto interactivo con números de las líneas de atención del distrito o prestador de salud mental para emergencias.',
      },
      {
        id: 'psico_q4',
        text: '¿Se implementan actividades continuas de prevención de Burnout, medición de clima y balance de carga laboral mental?',
        recommendation: 'Establecer pausas activas mentales obligatorias, políticas de desconexión laboral efectiva y horarios rotativos flexibles.',
      }
    ]
  },
  {
    id: 'Alturas',
    name: 'Trabajo Seguro en Alturas',
    lawReference: 'Resolución 4272 de 2021 (Colombia)',
    description: 'Gestión del riesgo en trabajos realizados por encima de 2.0 metros (andamios, techos, escaleras extensibles).',
    questions: [
      {
        id: 'alt_q1',
        text: '¿Se cuenta con el programa de prevención y protección contra caídas por escrito, aprobado y firmado por un Coordinador de Alturas?',
        recommendation: 'Estructurar el documento técnico detallando inventario de tareas en alturas, riesgos y medidas de control adoptadas.',
      },
      {
        id: 'alt_q2',
        text: '¿Los trabajadores que ejecutan labores en alturas cuentan con competencias vigentes (reentrenamiento anual) y aptitud médica?',
        recommendation: 'Verificar certificados en el portal de MinTrabajo y programar exámenes médicos anuales de énfasis para alturas (vértigo, cardiovascular).',
      },
      {
        id: 'alt_q3',
        text: '¿Los puntos de anclaje, líneas de vida fijas o temporales y arneses cuentan con certificación física de fabricante y prueba anual?',
        recommendation: 'Llevar hoja de vida de cada arnés e inspeccionarlos físicamente antes de cada uso. Certificar anualmente los puntos fijos.',
      },
      {
        id: 'alt_q4',
        text: '¿Se tiene estipulado un procedimiento escrito para rescate en alturas y se cuenta con al menos un kit de rescate y brigada entrenada?',
        recommendation: 'Realizar simulacro anual de rescate vertical con el kit equipado de poleas, ascendedores y camilla de evacuación vertical.',
      }
    ]
  },
  {
    id: 'Litio',
    name: 'Riesgo Tecnológico en Baterías de Litio',
    lawReference: 'Buenas Prácticas NFPA 855 y Gestión Tecnológica SST (Colombia)',
    description: 'Prevención de embalamiento térmico en zonas de carga de montacargas, scooters, tabletas o subestaciones.',
    questions: [
      {
        id: 'litio_q1',
        text: '¿Las zonas de carga de equipos con baterías de litio se encuentran en áreas independientes, ventiladas y sin material combustible?',
        recommendation: 'Establecer una jaula de carga retirada de papelería, maderas o bodegas principales, con extracción mecánica de aire activa.',
      },
      {
        id: 'litio_q2',
        text: '¿Se dispone de agentes extintores encapsuladores de agua con aditivo especial (ej: F-500) óptimos para mitigar fuegos químicos clase D/Litio?',
        recommendation: 'Los extintores convencionales de ABC o CO2 son ineficientes ante el litio. Instalar extintores cargados con agente F-500 en la bahía de carga.',
      },
      {
        id: 'litio_q3',
        text: '¿Se realiza inspección térmica continua (termografía o pirómetros digitales rápidos) sobre los cargadores de litio en horas pico?',
        recommendation: 'Implementar rondas con termómetros láser apuntando a las conexiones e incorporar sensores de sobretemperatura con corte automático.',
      },
      {
        id: 'litio_q4',
        text: '¿Se encuentra documentado un protocolo estricto para aislamiento o sumersión rápida de celdas infladas, húmedas o calientes?',
        recommendation: 'Tener dispuesto un contenedor lleno de arena seca o agua desmineralizada para sumergir de inmediato una unidad sospechosa antes del escape térmico.',
      }
    ]
  },
  {
    id: 'Quimicos',
    name: 'Riesgo Químico - Sistema Globalmente Armonizado',
    lawReference: 'Decreto 1496 de 2018 y Resoluciones SGA (Colombia)',
    description: 'Uso de pictogramas, fichas de seguridad en puestos de trabajo, matrices de compatibilidad física y diques.',
    questions: [
      {
        id: 'quim_q1',
        text: '¿Todos los productos químicos de la edificación están marcados bajo el Sistema Globalmente Armonizado (SGA) con pictogramas claros?',
        recommendation: 'Etiquetar atomizadores de limpieza, lubricantes o solventes con las palabras de advertencia (Peligro/Atención) e indicaciones de daño.',
      },
      {
        id: 'quim_q2',
        text: '¿Las Fichas de Datos de Seguridad (FDS) con estructura de 16 secciones se encuentran impresas o cargadas para consulta en el sitio?',
        recommendation: 'Imprimir las FDS de los productos de mayor uso y colocarlas en carpetas de acrílico junto a las estaciones donde se manipulan.',
      },
      {
        id: 'quim_q3',
        text: '¿Existe y se respeta físicamente una matriz de compatibilidad de almacenamiento de sustancias químicas en la bodega?',
        recommendation: 'Separar físicamente ácidos de bases, y combustibles de oxidantes mediante distancias mínimas de 3 metros o barreras físicas.',
      },
      {
        id: 'quim_q4',
        text: '¿Los tanques o canecas de gran volumen cuentan con diques o bandejas de contención con capacidad del 110% del envase principal?',
        recommendation: 'Construir diques de mampostería o adquirir estibas recolectoras plásticas de derrames certificadas para contener el volumen total.',
      }
    ]
  }
];

export const STANDARD_THREATS: Threat[] = [
  {
    id: 'incendio',
    name: 'Incendio Estructural / Explosión',
    type: 'Tecnologico',
    level: 'POSIBLE',
    description: 'Ignición súbita por fallas eléctricas en subestaciones, fugas de combustible o almacenamiento inadecuado de sólidos inflamables.'
  },
  {
    id: 'sismo',
    name: 'Sismo / Terremoto',
    type: 'Natural',
    level: 'PROBABLE',
    description: 'Movimiento telúrico severo derivado de fallas geológicas activas (Colombia se encuentra en zona de alta sismicidad).'
  },
  {
    id: 'inundacion',
    name: 'Inundación por Lluvias / Escorrentía',
    type: 'Natural',
    level: 'POSIBLE',
    description: 'Saturación de desagües fluviales públicos o desbordamiento de vertientes hídricas cercanas ante tormentas atípicas.'
  },
  {
    id: 'derrame',
    name: 'Derrame de Materiales Peligrosos',
    type: 'Tecnologico',
    level: 'POSIBLE',
    description: 'Pérdida de contención en tanques de ACPM, tanques de amoníaco de refrigeración o manipulación deficiente de ácidos.'
  },
  {
    id: 'riesgo_publico',
    name: 'Hurto, Asonada o Terrorismo (Riesgo Público)',
    type: 'Social',
    level: 'POSIBLE',
    description: 'Alteraciones de orden público en inmediaciones del predio corporativo, vandalismo o ingreso no autorizado.'
  },
  {
    id: 'litio_explosion',
    name: 'Embalamiento Térmico de Baterías de Litio',
    type: 'Tecnologico',
    level: 'POSIBLE',
    description: 'Fuego químico incontrolable originado en el rack de recarga de montacargas, patinetas o dispositivos de flota.'
  }
];

// Presets for the applet
export const EVALUATION_PRESETS = [
  {
    name: 'Empresa Industrial Certificada (Cumplimiento Alto 🟢)',
    description: 'Organización industrial de primer nivel con plan de prevención certificado, simulacros periódicos, sistemas alternos robustos, cumplimiento del PESV y excelente control del litio y químicos.',
    threat: {
      id: 'sismo',
      name: 'Sismo / Terremoto',
      type: 'Natural',
      level: 'PROBABLE' as const,
      description: 'Movimiento telúrico severe derivado de fallas geológicas activas.'
    },
    answers: {
      // Personas
      'p_org_q1': 1.0, 'p_org_q2': 1.0, 'p_org_q3': 1.0, // 1.0 Organ
      'p_cap_q1': 1.0, 'p_cap_q2': 1.0, 'p_cap_q3': 1.0, // 1.0 Capacitacion
      'p_dot_q1': 1.0, 'p_dot_q2': 0.5, 'p_dot_q3': 1.0, // 0.83 Dotacion
      // Recursos
      'r_mat_q1': 1.0, 'r_mat_q2': 1.0, 'r_mat_q3': 1.0, // 1.0 Materiales
      'r_inf_q1': 1.0, 'r_inf_q2': 0.5, 'r_inf_q3': 1.0, // 0.83 Infraestructura
      'r_equ_q1': 1.0, 'r_equ_q2': 1.0, 'r_equ_q3': 1.0, // 1.0 Equipos
      // Sistemas
      's_ser_q1': 1.0, 's_ser_q2': 1.0, 's_ser_q3': 1.0, // 1.0 Servicios
      's_alt_q1': 1.0, 's_alt_q2': 0.5, 's_alt_q3': 1.0, // 0.83 Alternos
      's_rec_q1': 1.0, 's_rec_q2': 1.0, 's_rec_q3': 1.0, // 1.0 Recuperacion
      // Transversales
      'pesv_q1': 1.0, 'pesv_q2': 1.0, 'pesv_q3': 1.0, 'pesv_q4': 1.0, // 1.0
      'psico_q1': 1.0, 'psico_q2': 1.0, 'psico_q3': 0.5, 'psico_q4': 0.5, // 0.75
      'alt_q1': 1.0, 'alt_q2': 1.0, 'alt_q3': 1.0, 'alt_q4': 0.5, // 0.875
      'litio_q1': 1.0, 'litio_q2': 1.0, 'litio_q3': 0.5, 'litio_q4': 1.0, // 0.875
      'quim_q1': 1.0, 'quim_q2': 1.0, 'quim_q3': 1.0, 'quim_q4': 0.5, // 0.875
    }
  },
  {
    name: 'Establecimiento Comercial PyME (Vulnerabilidad Media 🟡)',
    description: 'Comercio con brigada constituida, elementos básicos de extinción pero sin sistemas alternativos de soporte, sin sismorresistencia NSR-10, y con vacíos en PESV, alturas y riesgo psicosocial.',
    threat: {
      id: 'incendio',
      name: 'Incendio Estructural / Explosión',
      type: 'Tecnologico',
      level: 'PROBABLE' as const,
      description: 'Ignición súbita por fallas eléctricas en subestaciones o almacenamiento inadecuado.'
    },
    answers: {
      // Personas
      'p_org_q1': 0.5, 'p_org_q2': 0.5, 'p_org_q3': 0.5, // 0.5
      'p_cap_q1': 0.5, 'p_cap_q2': 0.5, 'p_cap_q3': 1.0, // 0.66
      'p_dot_q1': 0.5, 'p_dot_q2': 0.5, 'p_dot_q3': 0.0, // 0.33
      // Recursos
      'r_mat_q1': 1.0, 'r_mat_q2': 0.5, 'r_mat_q3': 0.0, // 0.5
      'r_inf_q1': 0.5, 'r_inf_q2': 0.0, 'r_inf_q3': 0.5, // 0.33
      'r_equ_q1': 1.0, 'r_equ_q2': 0.5, 'r_equ_q3': 0.0, // 0.5
      // Sistemas
      's_ser_q1': 0.5, 's_ser_q2': 1.0, 's_ser_q3': 0.5, // 0.66
      's_alt_q1': 0.5, 's_alt_q2': 0.0, 's_alt_q3': 0.5, // 0.33
      's_rec_q1': 0.5, 's_rec_q2': 0.5, 's_rec_q3': 0.0, // 0.33
      // Transversales
      'pesv_q1': 0.5, 'pesv_q2': 0.5, 'pesv_q3': 0.0, 'pesv_q4': 0.0, // 0.25
      'psico_q1': 0.5, 'psico_q2': 1.0, 'psico_q3': 0.0, 'psico_q4': 0.5, // 0.5
      'alt_q1': 0.5, 'alt_q2': 0.5, 'alt_q3': 0.0, 'alt_q4': 0.0, // 0.25
      'litio_q1': 0.5, 'litio_q2': 0.0, 'litio_q3': 0.0, 'litio_q4': 0.0, // 0.125
      'quim_q1': 1.0, 'quim_q2': 0.5, 'quim_q3': 0.5, 'quim_q4': 0.0, // 0.5
    }
  },
  {
    name: 'Edificio Crítico / Planta Tradicional (Vulnerabilidad Alta 🔴)',
    description: 'Instalación fabril sin planes de contingencia aprobados, sin brigada capacitada, sin pólizas ante catástrofes y alta carga de baterías de litio y químicos sin salvaguardia normativa.',
    threat: {
      id: 'litio_explosion',
      name: 'Embalamiento Térmico de Baterías de Litio',
      type: 'Tecnologico',
      level: 'INMINENTE' as const,
      description: 'Fuego químico incontrolable originado en el rack de recarga de montacargas.'
    },
    answers: {
      // Personas
      'p_org_q1': 0.0, 'p_org_q2': 0.0, 'p_org_q3': 0.0, // 0.0
      'p_cap_q1': 0.0, 'p_cap_q2': 0.0, 'p_cap_q3': 0.5, // 0.16
      'p_dot_q1': 0.0, 'p_dot_q2': 0.0, 'p_dot_q3': 0.0, // 0.0
      // Recursos
      'r_mat_q1': 0.5, 'r_mat_q2': 0.0, 'r_mat_q3': 0.0, // 0.16
      'r_inf_q1': 0.0, 'r_inf_q2': 0.0, 'r_inf_q3': 0.0, // 0.0
      'r_equ_q1': 0.5, 'r_equ_q2': 0.0, 'r_equ_q3': 0.0, // 0.16
      // Sistemas
      's_ser_q1': 0.0, 's_ser_q2': 0.5, 's_ser_q3': 0.0, // 0.16
      's_alt_q1': 0.0, 's_alt_q2': 0.0, 's_alt_q3': 0.0, // 0.0
      's_rec_q1': 0.0, 's_rec_q2': 0.0, 's_rec_q3': 0.0, // 0.0
      // Transversales
      'pesv_q1': 0.0, 'pesv_q2': 0.0, 'pesv_q3': 0.0, 'pesv_q4': 0.0, // 0.0
      'psico_q1': 0.0, 'psico_q2': 0.0, 'psico_q3': 0.0, 'psico_q4': 0.0, // 0.0
      'alt_q1': 0.0, 'alt_q2': 0.0, 'alt_q3': 0.0, 'alt_q4': 0.0, // 0.0
      'litio_q1': 0.0, 'litio_q2': 0.0, 'litio_q3': 0.0, 'litio_q4': 0.0, // 0.0
      'quim_q1': 0.5, 'quim_q2': 0.0, 'quim_q3': 0.0, 'quim_q4': 0.0, // 0.125
    }
  }
];

// Plans Operativos Normalizados (PON) - Procedimientos de respuesta por amenaza
export const PON_FLOWS: PONFlow[] = [
  {
    id: 'incendio',
    title: 'PON - Control de Incendios y Explosiones',
    threatType: 'Tecnologico',
    nodes: [
      { id: 'inc_1', label: 'Detección del Fuego / Activación de Alarma Manual', role: 'Cualquier Colaborador', type: 'start' },
      { id: 'inc_2', label: '¿El fuego es un conato (controlable con extintor)?', role: 'Brigadista / Trabajador cercano', type: 'decision' },
      { id: 'inc_2a', label: 'Desplegar extintor portátil adecuado (PQS / CO2 a la base)', role: 'Brigada de Emergencia', type: 'action' },
      { id: 'inc_3', label: 'Fuego fuera de control: Activar alarma general e iniciar Evacuación', role: 'Director de Emergencias COE', type: 'caution' },
      { id: 'inc_4', label: 'Corte inmediato de acometida general de Energía y Gas', role: 'Técnico de Mantenimiento', type: 'action' },
      { id: 'inc_5', label: 'Llamar a Bomberos Oficiales (Marcando 123) y dar ubicación exacta', role: 'Enlace de Comunicaciones', type: 'action' },
      { id: 'inc_6', label: 'Guiar al personal al Punto de Encuentro y realizar conteo censo', role: 'Coordinadores de Evacuación', type: 'action' },
      { id: 'inc_7', label: 'Entrega de mando a Bomberos y evaluación del retorno seguro', role: 'Comandante del COE', type: 'end' }
    ],
    edges: [
      { from: 'inc_1', to: 'inc_2' },
      { from: 'inc_2', to: 'inc_2a', condition: 'SÍ (Es Conato)' },
      { from: 'inc_2', to: 'inc_3', condition: 'NO (Es Declarado)' },
      { from: 'inc_2a', to: 'inc_7' },
      { from: 'inc_3', to: 'inc_4' },
      { from: 'inc_4', to: 'inc_5' },
      { from: 'inc_5', to: 'inc_6' },
      { from: 'inc_6', to: 'inc_7' }
    ]
  },
  {
    id: 'sismo',
    title: 'PON - Respuesta ante Sismo / Terremoto',
    threatType: 'Natural',
    nodes: [
      { id: 'sis_1', label: 'Ocurrencia del Movimiento Sísmico (Terremoto)', role: 'Todos', type: 'start' },
      { id: 'sis_2', label: 'Durante el sismo: NO evacuated. Adoptar posición de Autoprotección', role: 'Todos los Ocupantes', type: 'caution' },
      { id: 'sis_3', label: 'Ubicarse bajo vigas robustas, escritorios o alejado de ventanas', role: 'Todos', type: 'action' },
      { id: 'sis_4', label: 'Cese del movimiento técnico: Evaluar salida y daños parciales', role: 'Brigada / COE', type: 'decision' },
      { id: 'sis_5', label: 'Ordenar evacuación inmediata por rutas preestablecidas', role: 'Director del COE', type: 'action' },
      { id: 'sis_6', label: 'Revisión técnica de redes de gas y electricidad en el exterior', role: 'Mapeador de Sistemas', type: 'action' },
      { id: 'sis_7', label: 'Concentración plena en el Punto de Encuentro y atención heridos', role: 'Primeros Auxilios', type: 'end' }
    ],
    edges: [
      { from: 'sis_1', to: 'sis_2' },
      { from: 'sis_2', to: 'sis_3' },
      { from: 'sis_3', to: 'sis_4' },
      { from: 'sis_4', to: 'sis_5', condition: 'Hay Daño / Estabilidad Comprometida' },
      { from: 'sis_5', to: 'sis_6' },
      { from: 'sis_6', to: 'sis_7' }
    ]
  },
  {
    id: 'derrame',
    title: 'PON - Control de Derramamiento Químico',
    threatType: 'Tecnologico',
    nodes: [
      { id: 'der_1', label: 'Goteo, fuga o derrame visible de sustancia peligrosa', role: 'Manipulador / Operador', type: 'start' },
      { id: 'der_2', label: 'Identificar el producto mediante etiqueta SGA y FDS', role: 'Brigada Química', type: 'action' },
      { id: 'der_3', label: '¿Sustancia es tóxica, altamente combustible o inflamable?', role: 'Brigada / HSE', type: 'decision' },
      { id: 'der_4', label: 'Evacuar el área inmediata y ventilar mecánicamente', role: 'Todos', type: 'caution' },
      { id: 'der_5', label: 'Colocarse EPP químicos (traje Tyvek, máscara respiratoria, guantes nitrilo)', role: 'Brigada de Emergencia', type: 'action' },
      { id: 'der_6', label: 'Acordonar con diques absorbentes y esparcir neutralizador', role: 'Brigada Química', type: 'action' },
      { id: 'der_7', label: 'Disponer residuos en bolsas rojas marcadas como Residuo Peligroso RESPEL', role: 'HSE Oficial', type: 'end' }
    ],
    edges: [
      { from: 'der_1', to: 'der_2' },
      { from: 'der_2', to: 'der_3' },
      { from: 'der_3', to: 'der_4', condition: 'SÍ (Peligro Alto)' },
      { from: 'der_3', to: 'der_5', condition: 'NO (Peligro Bajo)' },
      { from: 'der_4', to: 'der_5' },
      { from: 'der_5', to: 'der_6' },
      { from: 'der_6', to: 'der_7' }
    ]
  },
  {
    id: 'litio_explosion',
    title: 'PON - Emergencia por Embalamiento Térmico de Litio',
    threatType: 'Tecnologico',
    nodes: [
      { id: 'lit_1', label: 'Detección de humo gris espeso, silbido o fuerte calor en baterías', role: 'Operador de Carga', type: 'start' },
      { id: 'lit_2', label: '¿Ha iniciado el incendio químico en la celda de la batería?', role: 'Brigada de Emergencia', type: 'decision' },
      { id: 'lit_2a', label: 'Aislar unidad con guantes térmicos gruesos y sumergir en arena seca', role: 'Operador Capacitado', type: 'action' },
      { id: 'lit_3', label: 'Embalamiento en marcha: Evacuación inmediata (humo altamente tóxico/HF)', role: 'Líder COE', type: 'caution' },
      { id: 'lit_4', label: 'Aplicar chorros constantes de agente encapsulador de fuego F-500', role: 'Brigada con Extintor Litio', type: 'action' },
      { id: 'lit_5', label: 'Llamada de alerta indicando "Fuego Químico de Litio" al 123', role: 'SST / COE Comunicaciones', type: 'action' },
      { id: 'lit_6', label: 'Enfriamiento sistemático de las celdas adyacentes para evitar propagación', role: 'Bomberos / Brigada', type: 'end' }
    ],
    edges: [
      { from: 'lit_1', to: 'lit_2' },
      { from: 'lit_2', to: 'lit_2a', condition: 'NO (Solo Sobretemperatura)' },
      { from: 'lit_2', to: 'lit_3', condition: 'SÍ (Igniado)' },
      { from: 'lit_2a', to: 'lit_6' },
      { from: 'lit_3', to: 'lit_4' },
      { from: 'lit_4', to: 'lit_5' },
      { from: 'lit_5', to: 'lit_6' }
    ]
  }
];
