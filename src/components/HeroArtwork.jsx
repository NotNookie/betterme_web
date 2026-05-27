export function HeroArtwork() {
  // The hero image should be placed at the project root as `hero-art.jpg`.
  // Vite will serve this from `/hero-art.jpg` at runtime.
  return (
    <div className="hero-art" aria-label="Better Me Digitals visual preview">
      <img src="/hero-art.jpg" alt="Better Me Digitals preview" />
    </div>
  );
}
