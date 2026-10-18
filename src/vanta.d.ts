// Ambient declarations for the two Vanta dependencies.
//
// Vanta's distribution ships no types, and `three` r134 (the version Vanta's
// bundle is built against) has no matching @types package — the published types
// track a far newer API. Declaring the two modules minimally is more accurate
// than pulling in typings for a version that is not actually loaded.

declare module 'three' {
  const THREE: unknown
  export = THREE
}

declare module 'vanta/dist/vanta.birds.min.js'

declare module 'vanta/dist/vanta.topology.min.js'

// p5 ships with @types/p5, but the runtime is only ever pulled in by Vanta's
// topology bundle through a dynamic import, so a module declaration keeps that
// import resolvable without leaning on the type package's DOM globals.
declare module 'p5'
