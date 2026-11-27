---
name: The Design System
colors:
  primary: '#1F4E79'
  secondary: '#4F81BD'
  light: '#DCEEFF'
  success: '#5BAE7E'
  danger: '#D96C6C'
  warning: '#E8C468'
  background: '#F5F7FA'
  grey: '#D9E2EC'
  surface: '#ffffff'
  on-primary: '#ffffff'
  on-secondary: '#ffffff'
  on-surface: '#1a1c1f'
typography:
  headline-lg:
    fontFamily: Inter, sans-serif
    fontSize: 30px
    fontWeight: '700'
    lineHeight: 38px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter, sans-serif
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Inter, sans-serif
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter, sans-serif
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter, sans-serif
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-lg:
    fontFamily: Inter, sans-serif
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
  label-sm:
    fontFamily: Inter, sans-serif
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  container-margin: 20px
  gutter: 16px
---

## Identidad y Estilo Visual

Este sistema de diseño está diseñado específicamente para una aplicación ágil, destinada a **usuarios con poco conocimiento técnico**. El enfoque principal es crear una experiencia **amigable, intuitiva y libre de fricciones o estrés**.

El objetivo emocional es reducir al máximo la carga cognitiva. Para lograrlo, utilizamos una jerarquía de información clara, agrupaciones lógicas de elementos, y llamadas a la acción evidentes, evitando a toda costa saturar al usuario con detalles innecesarios.

## Colores

La paleta se centra en tonos frescos, confiables y de rápido entendimiento:
- **Principal (#1F4E79)**: Se utilizará para elementos críticos, navegación y los llamados a la acción primarios. Este azul profundo asegura un excelente contraste (WCAG) y transmite mucha seguridad.
- **Secundario (#4F81BD)**: Apoya al color principal, sirviendo para acciones secundarias, iconos y estados interactivos.
- **Claro (#DCEEFF)**: Un tono celeste muy sutil empleado para fondos de elementos destacados, estados de hover o selección.
- **Background (#F5F7FA)** y **Grey (#D9E2EC)**: Proveen la estructura espacial de la app. Los grises suaves reemplazan los bordes y sombras agresivas para dar una sensación de que el contenido "respira".
- **Colores Semánticos (Success: #5BAE7E, Danger: #D96C6C, Warning: #E8C468)**: Tonos estandarizados pero no estridentes, que comunican claramente los estados de éxito, error o cuidado.

## Tipografía

Hemos pasado a utilizar **Inter** (o tipografías sans-serif de proporciones limpias y modernas similares) debido a su extrema legibilidad en aplicaciones digitales. La diferencia entre títulos (pesados, claros) y el cuerpo del texto asegura que el usuario pueda escanear la información rápidamente en vez de tener que leer de corrido.

## Iconografía (Material Icons)

En toda la aplicación haremos uso de **@mui/icons-material**. 
- La selección de iconos debe priorizar representaciones **universales** y ampliamente aceptadas (una 'casa' para inicio, una 'lupa' para buscar).
- Los iconos apoyarán a los textos, nunca estarán solos si su función es crítica. 
- Reforzarán la estética amigable usando un grosor de trazo consistente.

## Elevación y Formas Sutiles

- **Redondeos Sutiles (Border Radius):** Se han definido curvaturas leves (ej. `0.25rem` a `0.375rem`) en controles e interfaces. Un componente sin ninguna curva se percibe como rígido o intimidante (muy de desarrollador o industrial). Las pequeñas curvas humanizan el software, invitando a la interacción y haciéndolo ver amigable, pero manteniendo seriedad profesional.
- **Sombras:** Minimizadas en todo lo posible. Cuando se usen, serán sumamente sutiles y se teñirán levemente con el color Principal o Grey para integrarse mejor al fondo suave, sin parecer parches negros.

## Componentes Clave

### Botones
Los botones con la acción Principal serán sólidos con el color `#1F4E79`. Deben contar con buen padding para ser fácilmente cliqueables, asegurando fluidez (trabajo ágil). 

### Tarjetas y Contenedores
Serán el elemento estructurador por excelencia, reuniendo la información relacionada para ayudar a agrupar contenido en la mente del usuario. Se componen del fondo sólido (`#ffffff`), separados del background por un borde sutil en color Grey (`#D9E2EC`).

### Formularios y Text Inputs
Para este tipo de usuarios, los campos de entrada deben ser visualmente **muy evidentes**. 
- Etiquetas siempre visibles (nunca depender sólo del placeholder).
- Al hacer foco sobre un elemento, la aplicación debe reaccionar claramente cambiando el color del borde al color Secundario o Principal.
- Errores de validación deben aprovechar de inmediato el color Danger junto a un icono claro y un mensaje de texto explicativo, evitando lenguaje técnico.