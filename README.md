# Welcome to your Lovable project

TODO: Document your project here

## 🧪 Control de Calidad y Pruebas (QA)

Para garantizar la estabilidad, seguridad y el correcto funcionamiento de los flujos críticos de **Mindly**, el proyecto implementa una estrategia de pruebas automatizadas basada en la **Pirámide de Pruebas**, dividida en tres niveles de aislamiento.

### 📊 Cobertura y Riesgos Mitigados

| Nivel de Prueba | Componente / Flujo Evaluado | Riesgo Tecnológico Mitigado | Herramientas |
| :--- | :--- | :--- | :--- |
| **Unitaria** | `Chat.test.jsx` (Modo Teclado/Voz) | Frustración del usuario e inaccesibilidad al fallar la alternancia del asistente emocional por IA. | Vitest / React Testing Library |
| **Unitaria** | `dashboard.test.jsx` (Sidebar UI) | Bloqueo o congelamiento de la interfaz de navegación estructural en entornos *responsive*. | Vitest / React Testing Library |
| **Integración** | `canales_Atencion.test.jsx` (Módulo S.O.S) | **Riesgo Crítico:** Fallo en el despliegue del modal de confirmación o en el disparo del canal de auxilio durante crisis emocionales. | Vitest / RTL |
| **Integración** | `login.test.jsx` (Formulario de Acceso) | Desconexión asíncrona entre el estado de la UI de React, los hooks de enrutamiento y el SDK local de Firebase. | Vitest / RTL |
| **End-to-End (E2E)**| `auth.spec.ts` (Flujo Completo) | Quiebre total del embudo de retención; fallos de comunicación de red reales en el servidor o restricciones de base de datos. | Playwright |

---

### 🛠️ Requisitos e Instalación del Entorno de Pruebas

Antes de ejecutar los módulos de QA, asegúrate de clonar el entorno e instalar las dependencias de desarrollo necesarias:

```bash
# 1. Instalar las dependencias del proyecto (incluye Vitest y herramientas de testing)
npm install

# 2. Instalar los navegadores automatizados e infraestructura de Playwright
npx playwright install

Pruebas Unitarias y de Integración (Entorno en Memoria)
- npm run test

Pruebas End-to-End / Extremo a Extremo (Entorno Real)
# Ejecución estándar en segundo plano (Headless mode)
-npx playwright test

# Ejecución interactiva con Interfaz Gráfica (Ideal para auditorías en tiempo real)
-npx playwright test --ui
