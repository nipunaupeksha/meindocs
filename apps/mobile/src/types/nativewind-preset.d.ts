// NativeWind 4.2.7 ships an empty declaration for this CommonJS entry point.
declare module 'nativewind/preset' {
  import type { Config } from 'tailwindcss';
  const preset: Config;
  export default preset;
}
