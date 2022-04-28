const T_SHIRT = 'tshirt';
const HOODIE = 'hoodie';
const MUG = 'mug';
const CASE = 'case';
const LONGSLEEVE = 'longsleeve';
const POSTER = 'poster';

const productsSlug = [T_SHIRT, HOODIE, MUG, CASE, LONGSLEEVE, POSTER]

const tShirtVariant = {
  '0': 'n/a',
  '1': 's',
  '2': 'm',
  '3': 'l',
  '4': 'xl',
}

const tShirtColors = {
  '1': 'black',
  '2': 'white',
  '3': 'navy',
};

const hoodieVariant = tShirtVariant;

const hoodieColors = {
  '8': 'black',
  '9': 'white',
  '10': 'navy',
};

const longsleeveVariant = tShirtVariant;

const longSleeveColors = {
  '16': 'black',
  '17': 'white',
  '18': 'navy'
};

const mugVariant = {
  '1': '11oz'
};

const mugColors = {
  '0': 'n/a'
};

const caseVariant = {
  '1': '11',
  '2': 'X/XS',
  '3': 'XR',
  '4': '12',
  '5': '12pro',
  '6': '12promax',
  '7': '7and8',
  '8': 'se'
};

const caseColor = {
  '0': 'n/a'
};

const posterVariant = {
  '1': '10*10'
}

const posterColor = {
  '0': 'n/a'
};

const productsConfig = {
  [T_SHIRT]: {
    id: '2',
    variant: tShirtVariant,
    color: tShirtColors
  },
  [HOODIE]: {
    id: '3',
    variant: hoodieVariant,
    color: hoodieColors
  },
  [CASE]: {
    id: '6',
    variant: caseVariant,
    color: caseColor
  },
  [MUG]: {
    id: '7',
    variant: mugVariant,
    color: mugColors
  },
  [LONGSLEEVE]: {
    id: '8',
    variant: longsleeveVariant,
    color: longSleeveColors
  },
  [POSTER]: {
    id: '9',
    variant: posterVariant,
    color: posterColor
  },
}

module.exports = {
  productsSlug,
  productsConfig
}
