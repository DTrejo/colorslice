# Colorslice: manipulate color in an intuitive, discoverable, joy-inducing way.

# Possible feature todos
## hard?
- color changing e.g. turn a range of blue in the image to red
    - change that color only in certain parts of the image
- gradient picking, with CSS3 output

## UI hard?

- support for formulas e.g. based on red, generate colors for link, link:active,
  link:focus, link:visited.

## not too difficult
- complementary colors
- intelligent darken/lighten button
- colors in URL
    - image uploaded, included in URL, so can link to both color palette and
      image
- sample a larger, averaged patch of pixels instead of just one pixel.
- √layout that fully uses screen-space
- canvas should be more "droppable" / have better instructions. the
  drop target should expand to the whole screen like hakeru used to.

## Backend todos

- use browserify
- maybe use one of the component framework things, if browserify doesnt have it

## Measuring success
- over-the-shoulder sessions with designers (some RISD friends of mine)
- google analytics
- whether I accomplish the features (that we choose to be most important)

---

# Progress
- after reading about SVG and color matrix transformations, http://apike.ca/prog_svg_filter_feColorMatrix.html
  , my impression is that I won't be able to use SVG to turn e.g. green to red without
  changing the components of the other colors in the image.
- √simplify server-side; raw node w/ a few modules.
- √use stylus

# Next up
no anti-alias-ing when rendering. seems like this will work
  http://stackoverflow.com/questions/8597081/how-to-stretch-images-with-no-antialiasing
  http://jsfiddle.net/alnitak/j8YTe/

modularize & browserify client-side, colors in URL, large drop target,
obvious editability of the swatches.
