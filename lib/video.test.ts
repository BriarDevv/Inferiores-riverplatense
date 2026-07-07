import { describe, expect, test } from "vitest";
import { duracionISO, parseVideoLink, youtubeEmbedUrl } from "./video";

describe("parseVideoLink", () => {
  test("detecta un watch de youtube y extrae el id", () => {
    expect(parseVideoLink("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toEqual({
      fuente: "youtube",
      youtube_id: "dQw4w9WgXcQ",
    });
  });

  test("detecta youtu.be, shorts y embed", () => {
    expect(parseVideoLink("https://youtu.be/dQw4w9WgXcQ")?.youtube_id).toBe("dQw4w9WgXcQ");
    expect(parseVideoLink("https://www.youtube.com/shorts/dQw4w9WgXcQ")?.youtube_id).toBe(
      "dQw4w9WgXcQ",
    );
    expect(parseVideoLink("https://www.youtube.com/embed/dQw4w9WgXcQ")?.youtube_id).toBe(
      "dQw4w9WgXcQ",
    );
  });

  test("extrae el id de youtube aunque haya otros params antes de v=", () => {
    expect(
      parseVideoLink("https://www.youtube.com/watch?feature=share&v=dQw4w9WgXcQ&t=30"),
    ).toEqual({ fuente: "youtube", youtube_id: "dQw4w9WgXcQ" });
  });

  test("detecta tiktok y limpia el tracking del link de compartir", () => {
    expect(
      parseVideoLink(
        "https://www.tiktok.com/@canterariver/video/7234567890123456789?_t=8abc&_r=1",
      ),
    ).toEqual({
      fuente: "tiktok",
      video_url: "https://www.tiktok.com/@canterariver/video/7234567890123456789",
    });
  });

  test("detecta reels de instagram con y sin plural", () => {
    expect(parseVideoLink("https://www.instagram.com/reel/Cxyz123abcd/?igsh=xx")).toEqual({
      fuente: "instagram",
      video_url: "https://www.instagram.com/reel/Cxyz123abcd/",
    });
    expect(parseVideoLink("https://instagram.com/reels/Cxyz123abcd/")?.fuente).toBe(
      "instagram",
    );
  });

  test("cualquier otra url es video propio", () => {
    expect(
      parseVideoLink("https://xyz.supabase.co/storage/v1/object/public/videos/gol.mp4"),
    ).toEqual({
      fuente: "propio",
      video_url: "https://xyz.supabase.co/storage/v1/object/public/videos/gol.mp4",
    });
  });

  test("devuelve null para vacio o texto que no es url", () => {
    expect(parseVideoLink("")).toBeNull();
    expect(parseVideoLink("   ")).toBeNull();
    expect(parseVideoLink("un texto cualquiera")).toBeNull();
  });
});

describe("youtubeEmbedUrl", () => {
  test("usa el dominio nocookie", () => {
    expect(youtubeEmbedUrl("dQw4w9WgXcQ")).toBe(
      "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ",
    );
  });
});

describe("duracionISO", () => {
  test("convierte segundos a iso 8601", () => {
    expect(duracionISO(95)).toBe("PT1M35S");
    expect(duracionISO(45)).toBe("PT45S");
    expect(duracionISO(3665)).toBe("PT1H1M5S");
  });
});
