export const teaDiseaseDetails = {
  algal_spot: {
    label: 'Algal Spot',
    cause: 'Mainly caused by the parasitic alga Cephaleuros virescens.',
    symptoms: 'Small circular or irregular reddish-brown, orange, or purple spots appear on tea leaves. Older spots may become greenish-gray and slightly raised.',
    conditions: 'Warm and humid conditions, especially where drainage and air circulation are poor.',
    damage: 'Severe infection reduces healthy leaf area and photosynthesis. Leaves may weaken and fall early.',
    management: 'Improve drainage and air circulation, remove severely infected leaves, maintain good nutrition, and use approved copper-based treatments when necessary.',
  },
  brown_blight: {
    label: 'Brown Blight',
    cause: 'A fungal disease mainly associated with Colletotrichum species.',
    symptoms: 'Pale-green or yellowish spots appear first, then become brown or dark brown and increase in size. Yellow margins or concentric rings may appear.',
    conditions: 'High humidity, wet leaves, rainfall, and poor air circulation.',
    damage: 'Infected tissue becomes dry and dead. Severe infection can cause leaf fall and reduce plant growth.',
    management: 'Remove infected leaves, improve air circulation, reduce excess moisture, keep plants healthy, and use approved fungicides when severe.',
  },
  gray_blight: {
    label: 'Gray Blight',
    cause: 'A fungal disease commonly associated with Pestalotiopsis species.',
    symptoms: 'Pale-green or yellowish spots develop into gray or gray-brown lesions. Small black dots may appear inside infected areas.',
    conditions: 'High humidity, wet leaves, rainfall, and poor ventilation.',
    damage: 'Infected tissue may die and dry out. Severe infection can cause leaf holes or premature leaf fall.',
    management: 'Remove infected leaves, maintain proper spacing, improve air circulation, avoid excessive leaf wetness, and use approved fungicides if necessary.',
  },
  helopeltis: {
    label: 'Helopeltis',
    type: 'Insect pest damage (Tea Mosquito Bug), not a fungal disease.',
    cause: 'Helopeltis theivora feeds on young tea leaves, buds, and tender shoots by sucking plant sap.',
    symptoms: 'Reddish-brown or dark feeding spots appear. Young leaves may curl, deform, or dry out, and tender shoots may be damaged.',
    conditions: 'Moist and shaded conditions with abundant young plant growth.',
    damage: 'Heavy infestation damages young shoots and reduces fresh tea leaves available for harvesting.',
    management: 'Inspect plants regularly, remove heavily damaged shoots, control weeds, protect natural predators, and use approved insecticides when pest levels are high.',
  },
  red_leaf_spot: {
    label: 'Red Leaf Spot',
    cause: 'Generally associated with fungal infection; the exact pathogen may vary by tea variety and location.',
    symptoms: 'Small reddish or reddish-brown spots appear. They may enlarge and join to form irregular patches.',
    conditions: 'High humidity, prolonged leaf wetness, rainfall, and poor air circulation.',
    damage: 'Infected areas reduce healthy photosynthetic surface. Severe infection can weaken the plant and reduce growth.',
    management: 'Remove infected leaves, maintain field sanitation, improve air circulation, avoid excess moisture on leaves, and use approved fungicides after proper identification.',
  },
}

const diseaseAliases = {
  algal_spot: ['algal spot', 'algal_spot'],
  brown_blight: ['brown blight', 'brown_blight'],
  gray_blight: ['gray blight', 'grey blight', 'gray_blight', 'grey_blight'],
  helopeltis: ['helopeltis'],
  red_leaf_spot: ['red leaf spot', 'red spot', 'red_leaf_spot', 'red_spot'],
}

export const getTeaDiseaseKey = (label) => {
  const normalized = String(label || '').trim().toLowerCase().replaceAll('_', ' ')
  return Object.entries(diseaseAliases).find(([, aliases]) => aliases.includes(normalized))?.[0] || null
}
