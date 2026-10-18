# Visual assets and design notes

Generated with the built-in image-generation tool. These are original generated approximations of the reference's artwork, not its original source assets. The interface uses React, Bootstrap and ordinary CSS; there is no added animation or 3D runtime dependency. The hero is a rendered 3D image with a small CSS floating animation. Page scrolling stays native; IntersectionObserver reveals landing sections. Reduced-motion preferences disable the animation.

## Hero — client/public/images/wellness-sculpture.png

Prompt: Use case: stylized-concept. Generate a premium photorealistic 3D CGI website hero asset isolated on a genuinely transparent background. Landscape composition, 3:2 ratio. Two elegant sculptural silver chrome hands with realistically modeled fingers gently cupping a dense miniature garden of tiny lavender and violet hydrangea flowers, small green leaves, pale chartreuse buds and moss. The hands stretch diagonally from lower left toward upper right. A delicate tilted transparent glass rectangular prism / thin dark wireframe box encloses the floral garden and intersects the hands. Editorial surreal wellness art, refined high-end Octane render, polished liquid-metal reflections, soft studio light, ambient occlusion, realistic botanicals, very detailed dimensional textures. Whole sculpture visible with comfortable transparent margin, large central subject. Inspired by the Cogni:wave mental wellness web aesthetic: reflective metallic hands, lilac flowers and fine glass geometry. No typography, no text, no lettering, no logos, no website, no mockup, no flat vector shapes, no cartoon, no emoji. This is a standalone production web artwork, not a screenshot.

## Editorial cards — client/public/images/wellness-editorial.png

Prompt: Create a landscape editorial photography diptych with two equal-width vertical panels side by side, clean straight division at exactly the middle, no border, no text. Used as two image crops on a sophisticated mental-wellness website. LEFT HALF: candid close-up upper-body portrait of a cheerful young adult woman with dark hair tied back, thin round eyeglasses, wearing a neutral cream knit and muted plum scarf, natural open smile, softly blurred light grey studio backdrop, soft daylight, authentic skin texture, hands gently lifted in a relaxed conversational gesture. RIGHT HALF: wide minimalist architectural lifestyle photograph of one adult person in black contemporary casual clothing stretching both arms out within a giant white circular architectural arch, pale silver grey environment, full body, airy and optimistic. Both panels have matching soft daylight, fine film grain, muted colors, premium editorial photographic quality, generous framing, no illustrations, no lettering, no logos, no medical equipment.

## Components

- PageIntro: consistent illustrated page headers.
- WellnessArt: the local hero image.
- Layout: native scrolling, sticky navigation and landing-section reveal effects.
- editorial.css: final visual rules, responsive layouts and reduced-motion support.
- Dashboard: existing information and actions with new visual grouping and shortcut links.

Backend routes, forms, authentication, encryption, filtering, journal editing, assessments and Gemini behavior were not changed in this visual revision. Decorative photographs do not represent actual helpers or testimonials.
