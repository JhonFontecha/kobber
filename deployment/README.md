# Instalación local de Kobber

Esta carpeta contiene únicamente los instaladores y lanzadores para equipos de
escritorio. No forma parte del despliegue del servidor.

## Windows

- `windows/instalar_Kobber.bat`: primera instalación; se puede descargar y ejecutar solo.
- `windows/iniciar_Kobber.bat`: uso diario.
- `windows/actualizar_Kobber.bat`: actualiza una instalación limpia desde `origin/main`.

## macOS

- `macos/instalar_Kobber.command`: primera instalación; se puede descargar y ejecutar solo.
- `macos/iniciar_Kobber.command`: uso diario.
- `macos/actualizar_Kobber.command`: actualiza una instalación limpia desde `origin/main`.

La instalación predeterminada es `Documents/Proyectos/kobber`. El archivo
`backend/.env`, el perfil de Chrome y los datos locales se conservan durante
las actualizaciones y nunca se suben a Git.

El actualizador exige la rama `main`, rechaza cambios locales y usa una fusión
`fast-forward`; nunca descarta ni sobrescribe trabajo del usuario.
