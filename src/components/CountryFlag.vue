<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  countryCode: string;
  size?: "sm" | "md" | "lg";
}>();

const sizeClasses = computed(() => {
  switch (props.size) {
    case "sm":
      return "w-4 h-3";
    case "lg":
      return "w-8 h-6";
    default:
      return "w-6 h-4";
  }
});

const flagUrl = computed(() => {
  return `https://flagcdn.com/${props.countryCode.toLowerCase()}.svg`;
});

const countryName = computed(() => {
  const countries: Record<string, string> = {
    FR: "France",
    US: "États-Unis",
    GB: "Royaume-Uni",
    DE: "Allemagne",
    ES: "Espagne",
    IT: "Italie",
    CA: "Canada",
    AU: "Australie",
    JP: "Japon",
    CN: "Chine",
    BR: "Brésil",
    IN: "Inde",
    RU: "Russie",
    MX: "Mexique",
    AR: "Argentine",
    CH: "Suisse",
    NL: "Pays-Bas",
    BE: "Belgique",
    SE: "Suède",
    NO: "Norvège",
    DK: "Danemark",
    FI: "Finlande",
    PL: "Pologne",
    PT: "Portugal",
    GR: "Grèce",
    TR: "Turquie",
    EG: "Égypte",
    ZA: "Afrique du Sud",
    NG: "Nigéria",
    KE: "Kenya",
    MA: "Maroc",
    TN: "Tunisie",
    DZ: "Algérie",
    SN: "Sénégal",
    CI: "Côte d'Ivoire",
    KR: "Corée du Sud",
    TH: "Thaïlande",
    VN: "Viêt Nam",
    ID: "Indonésie",
    MY: "Malaisie",
    SG: "Singapour",
    PH: "Philippines",
    BD: "Bangladesh",
    PK: "Pakistan",
    LK: "Sri Lanka",
    NP: "Népal",
    MM: "Myanmar",
    KH: "Cambodge",
    LA: "Laos",
    MN: "Mongolie",
    KZ: "Kazakhstan",
    UZ: "Ouzbékistan",
    KG: "Kirghizistan",
    TJ: "Tadjikistan",
    TM: "Turkménistan",
    AF: "Afghanistan",
    IR: "Iran",
    IQ: "Irak",
    SY: "Syrie",
    LB: "Liban",
    JO: "Jordanie",
    IL: "Israël",
    PS: "Palestine",
    SA: "Arabie Saoudite",
    AE: "Émirats Arabes Unis",
    QA: "Qatar",
    BH: "Bahreïn",
    KW: "Koweït",
    OM: "Oman",
    YE: "Yémen",
    UA: "Ukraine",
    BY: "Biélorussie",
    MD: "Moldavie",
    RO: "Roumanie",
    BG: "Bulgarie",
    RS: "Serbie",
    BA: "Bosnie-Herzégovine",
    HR: "Croatie",
    SI: "Slovénie",
    SK: "Slovaquie",
    CZ: "République Tchèque",
    HU: "Hongrie",
    AT: "Autriche",
    LI: "Liechtenstein",
    LU: "Luxembourg",
    MC: "Monaco",
    AD: "Andorre",
    SM: "Saint-Marin",
    VA: "Vatican",
    MT: "Malte",
    CY: "Chypre",
    IS: "Islande",
    IE: "Irlande",
    AL: "Albanie",
    MK: "Macédoine du Nord",
    ME: "Monténégro",
    LT: "Lituanie",
    LV: "Lettonie",
    EE: "Estonie",
    CL: "Chili",
    PE: "Pérou",
    BO: "Bolivie",
    CO: "Colombie",
    VE: "Venezuela",
    GY: "Guyana",
    SR: "Suriname",
    UY: "Uruguay",
    PY: "Paraguay",
    EC: "Équateur",
    CR: "Costa Rica",
    PA: "Panama",
    NI: "Nicaragua",
    HN: "Honduras",
    GT: "Guatemala",
    BZ: "Belize",
    SV: "Salvador",
    CU: "Cuba",
    JM: "Jamaïque",
    HT: "Haïti",
    DO: "République Dominicaine",
    PR: "Porto Rico",
    TT: "Trinité-et-Tobago",
    BB: "Barbade",
    LC: "Sainte-Lucie",
    GD: "Grenade",
    VC: "Saint-Vincent-et-les-Grenadines",
    AG: "Antigua-et-Barbuda",
    KN: "Saint-Christophe-et-Niévès",
    DM: "Dominique",
    BS: "Bahamas",
    BM: "Bermudes",
    KY: "Îles Caïmans",
    TC: "Îles Turques-et-Caïques",
    VG: "Îles Vierges britanniques",
    VI: "Îles Vierges américaines",
    AW: "Aruba",
    CW: "Curaçao",
    SX: "Saint-Martin",
    BQ: "Bonaire",
    MQ: "Martinique",
    GP: "Guadeloupe",
    GF: "Guyane française",
    RE: "La Réunion",
    YT: "Mayotte",
    NC: "Nouvelle-Calédonie",
    PF: "Polynésie française",
    WF: "Wallis-et-Futuna",
    PM: "Saint-Pierre-et-Miquelon",
    BL: "Saint-Barthélemy",
    MF: "Saint-Martin",
    NZ: "Nouvelle-Zélande",
    FJ: "Fidji",
    PG: "Papouasie-Nouvelle-Guinée",
    SB: "Îles Salomon",
    VU: "Vanuatu",
    TO: "Tonga",
    WS: "Samoa",
    KI: "Kiribati",
    TV: "Tuvalu",
    NR: "Nauru",
    PW: "Palaos",
    FM: "Micronésie",
    MH: "Îles Marshall",
    CK: "Îles Cook",
    NU: "Niue",
    TK: "Tokelau",
  };

  return countries[props.countryCode] || props.countryCode;
});

function handleImageError(event: Event) {
  const target = event.target as HTMLImageElement;
  if (target) {
    target.style.display = 'none';
  }
}
</script>

<template>
  <div
    class="inline-flex items-center px-2 py-1 space-x-2 border rounded-full bg-white/20 backdrop-blur-sm border-white/20 sm:px-3"
    :title="countryName"
  >
    <img
      :src="flagUrl"
      :alt="`Drapeau ${countryName}`"
      :class="sizeClasses"
      class="object-cover border rounded-sm shadow-sm border-white/20"
      loading="lazy"
      @error="handleImageError"
    />
    <span class="text-xs font-medium text-modern-secondary sm:text-sm">
      {{ countryCode }}
    </span>
  </div>
</template>