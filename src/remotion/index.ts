import { registerRoot } from "remotion";
import { loadFont as loadJakarta } from "@remotion/google-fonts/PlusJakartaSans";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";
import { RemotionRoot } from "./Root";

// Fonts are registered here (once, before any frame renders) so every
// component can use `var(--font-sans)` / `var(--font-mono)`.
const { fontFamily: sans } = loadJakarta("normal", {
  weights: ["400", "500", "600", "700", "800"],
  subsets: ["latin"],
});
const { fontFamily: mono } = loadMono("normal", {
  weights: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

document.documentElement.style.setProperty("--font-sans", sans);
document.documentElement.style.setProperty("--font-mono", mono);

registerRoot(RemotionRoot);
