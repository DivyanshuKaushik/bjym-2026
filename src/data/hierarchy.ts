/**
 * BJYM Chhattisgarh organizational hierarchy — District -> Assembly -> Mandal.
 * Generated from the official BJYM organizational-districts Excel sheet
 * (मण्डल का नाम.xlsx): 36 districts, 102 assemblies, 479 mandals — verbatim,
 * no invented data.
 *
 * NOTE: the source sheet has NO Lok Sabha column. BJYM's organizational
 * districts here (e.g. भिलाई as distinct from दुर्ग, रायपुर शहर/ग्रामीण split)
 * don't map 1:1 onto the 11 official Lok Sabha constituencies without a
 * separately verified mapping, so no Lok Sabha level is fabricated here.
 * District is the top level. See the accompanying chat message for how
 * to add a verified Lok Sabha grouping later if you provide one.
 */

export type Mandal = { id: string; nameEn: string; nameHi: string };
export type Assembly = { id: string; nameEn: string; nameHi: string; mandals: Mandal[] };
export type District = { id: string; nameEn: string; nameHi: string; assemblies: Assembly[] };

export const HIERARCHY: District[] = [
  {
    id: "d1",
    nameEn: "मनेन्द्रगढ़ चिरमिरी भरतपुर",
    nameHi: "मनेन्द्रगढ़ चिरमिरी भरतपुर",
    assemblies: [
      {
        id: "d1-a1",
        nameEn: "मनेन्द्रगढ़",
        nameHi: "मनेन्द्रगढ़",
        mandals: [
          { id: "d1-a1-m1", nameEn: "मनेन्द्रगढ़", nameHi: "मनेन्द्रगढ़" },
          { id: "d1-a1-m2", nameEn: "चिरमिरी", nameHi: "चिरमिरी" },
          { id: "d1-a1-m3", nameEn: "खड़गंवा", nameHi: "खड़गंवा" },
        ],
      },
      {
        id: "d1-a2",
        nameEn: "भरतपुर सोनहत",
        nameHi: "भरतपुर सोनहत",
        mandals: [
          { id: "d1-a2-m1", nameEn: "जनकपुर", nameHi: "जनकपुर" },
          { id: "d1-a2-m2", nameEn: "कुंवारपुर", nameHi: "कुंवारपुर" },
          { id: "d1-a2-m3", nameEn: "कोटाडोल", nameHi: "कोटाडोल" },
          { id: "d1-a2-m4", nameEn: "नागपुर", nameHi: "नागपुर" },
          { id: "d1-a2-m5", nameEn: "केल्हारी", nameHi: "केल्हारी" },
          { id: "d1-a2-m6", nameEn: "हसदेव", nameHi: "हसदेव" },
        ],
      },
    ],
  },
  {
    id: "d2",
    nameEn: "Korea",
    nameHi: "कोरिया",
    assemblies: [
      {
        id: "d2-a1",
        nameEn: "भरतपुर सोनहत",
        nameHi: "भरतपुर सोनहत",
        mandals: [
          { id: "d2-a1-m1", nameEn: "सोनहत", nameHi: "सोनहत" },
        ],
      },
      {
        id: "d2-a2",
        nameEn: "बैकुंठपुर",
        nameHi: "बैकुंठपुर",
        mandals: [
          { id: "d2-a2-m1", nameEn: "सलका", nameHi: "सलका" },
          { id: "d2-a2-m2", nameEn: "चरचा", nameHi: "चरचा" },
          { id: "d2-a2-m3", nameEn: "पटना", nameHi: "पटना" },
          { id: "d2-a2-m4", nameEn: "कुड़ेली", nameHi: "कुड़ेली" },
          { id: "d2-a2-m5", nameEn: "बैकुंठपुर", nameHi: "बैकुंठपुर" },
          { id: "d2-a2-m6", nameEn: "बचरापोड़ी", nameHi: "बचरापोड़ी" },
        ],
      },
    ],
  },
  {
    id: "d3",
    nameEn: "Surajpur",
    nameHi: "सूरजपुर",
    assemblies: [
      {
        id: "d3-a1",
        nameEn: "प्रेमनगर",
        nameHi: "प्रेमनगर",
        mandals: [
          { id: "d3-a1-m1", nameEn: "सूरजपुर ग्रामीण", nameHi: "सूरजपुर ग्रामीण" },
          { id: "d3-a1-m2", nameEn: "देवनगर", nameHi: "देवनगर" },
          { id: "d3-a1-m3", nameEn: "सूरजपुर शहर", nameHi: "सूरजपुर शहर" },
          { id: "d3-a1-m4", nameEn: "विश्रामपुर", nameHi: "विश्रामपुर" },
          { id: "d3-a1-m5", nameEn: "रामानुजनगर", nameHi: "रामानुजनगर" },
          { id: "d3-a1-m6", nameEn: "प्रेमनगर", nameHi: "प्रेमनगर" },
        ],
      },
      {
        id: "d3-a2",
        nameEn: "भटगाँव",
        nameHi: "भटगाँव",
        mandals: [
          { id: "d3-a2-m1", nameEn: "बिहारपुर", nameHi: "बिहारपुर" },
          { id: "d3-a2-m2", nameEn: "ओडगी", nameHi: "ओडगी" },
          { id: "d3-a2-m3", nameEn: "भैयाथान", nameHi: "भैयाथान" },
          { id: "d3-a2-m4", nameEn: "भटगांव", nameHi: "भटगांव" },
          { id: "d3-a2-m5", nameEn: "लटोरी", nameHi: "लटोरी" },
          { id: "d3-a2-m6", nameEn: "शिवनंदनपुर", nameHi: "शिवनंदनपुर" },
        ],
      },
      {
        id: "d3-a3",
        nameEn: "प्रतापपुर",
        nameHi: "प्रतापपुर",
        mandals: [
          { id: "d3-a3-m1", nameEn: "प्रतापपुर", nameHi: "प्रतापपुर" },
          { id: "d3-a3-m2", nameEn: "गोविन्दपुर", nameHi: "गोविन्दपुर" },
          { id: "d3-a3-m3", nameEn: "जरही", nameHi: "जरही" },
        ],
      },
    ],
  },
  {
    id: "d4",
    nameEn: "Balrampur",
    nameHi: "बलरामपुर",
    assemblies: [
      {
        id: "d4-a1",
        nameEn: "प्रतापपुर",
        nameHi: "प्रतापपुर",
        mandals: [
          { id: "d4-a1-m1", nameEn: "रघुनाथनगर", nameHi: "रघुनाथनगर" },
          { id: "d4-a1-m2", nameEn: "वाड्रफनगर", nameHi: "वाड्रफनगर" },
          { id: "d4-a1-m3", nameEn: "वाड्रफनगर पूर्वी", nameHi: "वाड्रफनगर पूर्वी" },
        ],
      },
      {
        id: "d4-a2",
        nameEn: "रामानुजगंज",
        nameHi: "रामानुजगंज",
        mandals: [
          { id: "d4-a2-m1", nameEn: "सनावल", nameHi: "सनावल" },
          { id: "d4-a2-m2", nameEn: "रामानुजगंज", nameHi: "रामानुजगंज" },
          { id: "d4-a2-m3", nameEn: "महावीरगंज", nameHi: "महावीरगंज" },
          { id: "d4-a2-m4", nameEn: "बलरामपुर", nameHi: "बलरामपुर" },
          { id: "d4-a2-m5", nameEn: "डवरा", nameHi: "डवरा" },
        ],
      },
      {
        id: "d4-a3",
        nameEn: "सामरी",
        nameHi: "सामरी",
        mandals: [
          { id: "d4-a3-m1", nameEn: "राजपुर", nameHi: "राजपुर" },
          { id: "d4-a3-m2", nameEn: "बरियों", nameHi: "बरियों" },
          { id: "d4-a3-m3", nameEn: "शंकरगढ़", nameHi: "शंकरगढ़" },
          { id: "d4-a3-m4", nameEn: "चांदो", nameHi: "चांदो" },
          { id: "d4-a3-m5", nameEn: "कुसमी", nameHi: "कुसमी" },
        ],
      },
    ],
  },
  {
    id: "d5",
    nameEn: "Surguja",
    nameHi: "सरगुजा",
    assemblies: [
      {
        id: "d5-a1",
        nameEn: "लुंड्रा",
        nameHi: "लुंड्रा",
        mandals: [
          { id: "d5-a1-m1", nameEn: "दरिमा", nameHi: "दरिमा" },
          { id: "d5-a1-m2", nameEn: "लुन्ड्रा", nameHi: "लुन्ड्रा" },
          { id: "d5-a1-m3", nameEn: "परसा", nameHi: "परसा" },
          { id: "d5-a1-m4", nameEn: "धौरपुर", nameHi: "धौरपुर" },
          { id: "d5-a1-m5", nameEn: "कुन्नी", nameHi: "कुन्नी" },
        ],
      },
      {
        id: "d5-a2",
        nameEn: "अंबिकापुर",
        nameHi: "अंबिकापुर",
        mandals: [
          { id: "d5-a2-m1", nameEn: "लखनपुर", nameHi: "लखनपुर" },
          { id: "d5-a2-m2", nameEn: "अम्बिकापुर ग्रामीण", nameHi: "अम्बिकापुर ग्रामीण" },
          { id: "d5-a2-m3", nameEn: "महामाया", nameHi: "महामाया" },
          { id: "d5-a2-m4", nameEn: "समलाया", nameHi: "समलाया" },
          { id: "d5-a2-m5", nameEn: "रामगढ़", nameHi: "रामगढ़" },
          { id: "d5-a2-m6", nameEn: "देवगढ़", nameHi: "देवगढ़" },
        ],
      },
      {
        id: "d5-a3",
        nameEn: "सीतापुर",
        nameHi: "सीतापुर",
        mandals: [
          { id: "d5-a3-m1", nameEn: "नवानगर", nameHi: "नवानगर" },
          { id: "d5-a3-m2", nameEn: "बतौली", nameHi: "बतौली" },
          { id: "d5-a3-m3", nameEn: "मैनपाट", nameHi: "मैनपाट" },
          { id: "d5-a3-m4", nameEn: "सीतापुर", nameHi: "सीतापुर" },
          { id: "d5-a3-m5", nameEn: "राजापुर", nameHi: "राजापुर" },
        ],
      },
    ],
  },
  {
    id: "d6",
    nameEn: "Jashpur",
    nameHi: "जशपुर",
    assemblies: [
      {
        id: "d6-a1",
        nameEn: "जशपुर",
        nameHi: "जशपुर",
        mandals: [
          { id: "d6-a1-m1", nameEn: "पण्डरापाठ", nameHi: "पण्डरापाठ" },
          { id: "d6-a1-m2", nameEn: "सन्ना", nameHi: "सन्ना" },
          { id: "d6-a1-m3", nameEn: "बगीचा", nameHi: "बगीचा" },
          { id: "d6-a1-m4", nameEn: "सोनक्यारी", nameHi: "सोनक्यारी" },
          { id: "d6-a1-m5", nameEn: "मनोरा", nameHi: "मनोरा" },
          { id: "d6-a1-m6", nameEn: "जशपुर ग्रामीण", nameHi: "जशपुर ग्रामीण" },
          { id: "d6-a1-m7", nameEn: "जशपुर शहर", nameHi: "जशपुर शहर" },
        ],
      },
      {
        id: "d6-a2",
        nameEn: "कुनकुरी",
        nameHi: "कुनकुरी",
        mandals: [
          { id: "d6-a2-m1", nameEn: "कुनकुरी ग्रामीण", nameHi: "कुनकुरी ग्रामीण" },
          { id: "d6-a2-m2", nameEn: "कुनकुरी शहर", nameHi: "कुनकुरी शहर" },
          { id: "d6-a2-m3", nameEn: "दुलदुला", nameHi: "दुलदुला" },
          { id: "d6-a2-m4", nameEn: "तपकरा", nameHi: "तपकरा" },
          { id: "d6-a2-m5", nameEn: "पण्डरीपानी", nameHi: "पण्डरीपानी" },
        ],
      },
      {
        id: "d6-a3",
        nameEn: "पत्थलगाँव",
        nameHi: "पत्थलगाँव",
        mandals: [
          { id: "d6-a3-m1", nameEn: "महादेवडांड", nameHi: "महादेवडांड" },
          { id: "d6-a3-m2", nameEn: "कांसाबेल", nameHi: "कांसाबेल" },
          { id: "d6-a3-m3", nameEn: "दोकड़ा", nameHi: "दोकड़ा" },
          { id: "d6-a3-m4", nameEn: "बागबहार", nameHi: "बागबहार" },
          { id: "d6-a3-m5", nameEn: "लुडेग", nameHi: "लुडेग" },
          { id: "d6-a3-m6", nameEn: "पत्थलगांव शहर", nameHi: "पत्थलगांव शहर" },
          { id: "d6-a3-m7", nameEn: "पत्थलगांव ग्रामीण", nameHi: "पत्थलगांव ग्रामीण" },
          { id: "d6-a3-m8", nameEn: "कोतबा", nameHi: "कोतबा" },
        ],
      },
    ],
  },
  {
    id: "d7",
    nameEn: "रायगढ़",
    nameHi: "रायगढ़",
    assemblies: [
      {
        id: "d7-a1",
        nameEn: "लैलूंगा",
        nameHi: "लैलूंगा",
        mandals: [
          { id: "d7-a1-m1", nameEn: "राजपुर", nameHi: "राजपुर" },
          { id: "d7-a1-m2", nameEn: "लैलूँगा", nameHi: "लैलूँगा" },
          { id: "d7-a1-m3", nameEn: "मुकडेगा", nameHi: "मुकडेगा" },
          { id: "d7-a1-m4", nameEn: "रोडोपाली", nameHi: "रोडोपाली" },
          { id: "d7-a1-m5", nameEn: "तमनार", nameHi: "तमनार" },
          { id: "d7-a1-m6", nameEn: "सम्बलपुरी", nameHi: "सम्बलपुरी" },
        ],
      },
      {
        id: "d7-a2",
        nameEn: "खरसिया",
        nameHi: "खरसिया",
        mandals: [
          { id: "d7-a2-m1", nameEn: "जोबी", nameHi: "जोबी" },
          { id: "d7-a2-m2", nameEn: "चपले", nameHi: "चपले" },
          { id: "d7-a2-m3", nameEn: "महका", nameHi: "महका" },
          { id: "d7-a2-m4", nameEn: "खरसिया", nameHi: "खरसिया" },
          { id: "d7-a2-m5", nameEn: "तारापुर", nameHi: "तारापुर" },
          { id: "d7-a2-m6", nameEn: "किरोड़ीमल नगर", nameHi: "किरोड़ीमल नगर" },
          { id: "d7-a2-m7", nameEn: "सूपा", nameHi: "सूपा" },
        ],
      },
      {
        id: "d7-a3",
        nameEn: "धरमजयगढ़",
        nameHi: "धरमजयगढ़",
        mandals: [
          { id: "d7-a3-m1", nameEn: "कापू", nameHi: "कापू" },
          { id: "d7-a3-m2", nameEn: "बांकारुमा", nameHi: "बांकारुमा" },
          { id: "d7-a3-m3", nameEn: "धरमजयगढ़", nameHi: "धरमजयगढ़" },
          { id: "d7-a3-m4", nameEn: "घरघोडा", nameHi: "घरघोडा" },
          { id: "d7-a3-m5", nameEn: "कुड़ुमकेला", nameHi: "कुड़ुमकेला" },
          { id: "d7-a3-m6", nameEn: "छाल", nameHi: "छाल" },
        ],
      },
      {
        id: "d7-a4",
        nameEn: "रायगढ़",
        nameHi: "रायगढ़",
        mandals: [
          { id: "d7-a4-m1", nameEn: "रायगढ़ शहर", nameHi: "रायगढ़ शहर" },
          { id: "d7-a4-m2", nameEn: "जूटमिल चक्रधर", nameHi: "जूटमिल चक्रधर" },
          { id: "d7-a4-m3", nameEn: "लोईंग", nameHi: "लोईंग" },
          { id: "d7-a4-m4", nameEn: "कोड़ातराई", nameHi: "कोड़ातराई" },
          { id: "d7-a4-m5", nameEn: "पुसौर", nameHi: "पुसौर" },
        ],
      },
    ],
  },
  {
    id: "d8",
    nameEn: "सारंगढ़ बिलाईगढ़",
    nameHi: "सारंगढ़ बिलाईगढ़",
    assemblies: [
      {
        id: "d8-a1",
        nameEn: "रायगढ़",
        nameHi: "रायगढ़",
        mandals: [
          { id: "d8-a1-m1", nameEn: "सरिया", nameHi: "सरिया" },
        ],
      },
      {
        id: "d8-a2",
        nameEn: "सारंगढ़",
        nameHi: "सारंगढ़",
        mandals: [
          { id: "d8-a2-m1", nameEn: "कोसीर", nameHi: "कोसीर" },
          { id: "d8-a2-m2", nameEn: "भेड़वनगुडेली", nameHi: "भेड़वनगुडेली" },
          { id: "d8-a2-m3", nameEn: "केडार", nameHi: "केडार" },
          { id: "d8-a2-m4", nameEn: "सालरमल्दा", nameHi: "सालरमल्दा" },
          { id: "d8-a2-m5", nameEn: "सारंगढ़", nameHi: "सारंगढ़" },
          { id: "d8-a2-m6", nameEn: "बरमकेला", nameHi: "बरमकेला" },
          { id: "d8-a2-m7", nameEn: "लेन्ध्रा", nameHi: "लेन्ध्रा" },
        ],
      },
      {
        id: "d8-a3",
        nameEn: "बिलाईगढ़",
        nameHi: "बिलाईगढ़",
        mandals: [
          { id: "d8-a3-m1", nameEn: "बिलाईगढ़", nameHi: "बिलाईगढ़" },
          { id: "d8-a3-m2", nameEn: "पवनी", nameHi: "पवनी" },
          { id: "d8-a3-m3", nameEn: "भटगांव", nameHi: "भटगांव" },
          { id: "d8-a3-m4", nameEn: "सरसींवा", nameHi: "सरसींवा" },
        ],
      },
    ],
  },
  {
    id: "d9",
    nameEn: "Balodabazar",
    nameHi: "बलौदाबाजार",
    assemblies: [
      {
        id: "d9-a1",
        nameEn: "बिलाईगढ़",
        nameHi: "बिलाईगढ़",
        mandals: [
          { id: "d9-a1-m1", nameEn: "टुंड्रा", nameHi: "टुंड्रा" },
          { id: "d9-a1-m2", nameEn: "बया", nameHi: "बया" },
        ],
      },
      {
        id: "d9-a2",
        nameEn: "कसडोल",
        nameHi: "कसडोल",
        mandals: [
          { id: "d9-a2-m1", nameEn: "लवन", nameHi: "लवन" },
          { id: "d9-a2-m2", nameEn: "लाहोद", nameHi: "लाहोद" },
          { id: "d9-a2-m3", nameEn: "कसडोल", nameHi: "कसडोल" },
          { id: "d9-a2-m4", nameEn: "कटगी", nameHi: "कटगी" },
          { id: "d9-a2-m5", nameEn: "पलारी", nameHi: "पलारी" },
          { id: "d9-a2-m6", nameEn: "संडी", nameHi: "संडी" },
          { id: "d9-a2-m7", nameEn: "रोहांसी", nameHi: "रोहांसी" },
        ],
      },
      {
        id: "d9-a3",
        nameEn: "भाटापारा",
        nameHi: "भाटापारा",
        mandals: [
          { id: "d9-a3-m1", nameEn: "सिमगा", nameHi: "सिमगा" },
          { id: "d9-a3-m2", nameEn: "भाटापारा ग्रामीण", nameHi: "भाटापारा ग्रामीण" },
          { id: "d9-a3-m3", nameEn: "कौशलपुर (कोलिहा)", nameHi: "कौशलपुर (कोलिहा)" },
          { id: "d9-a3-m4", nameEn: "निपनिया", nameHi: "निपनिया" },
          { id: "d9-a3-m5", nameEn: "भाटापारा शहर", nameHi: "भाटापारा शहर" },
        ],
      },
      {
        id: "d9-a4",
        nameEn: "बलौदा बाजार",
        nameHi: "बलौदा बाजार",
        mandals: [
          { id: "d9-a4-m1", nameEn: "सुहेला", nameHi: "सुहेला" },
          { id: "d9-a4-m2", nameEn: "हथबंद", nameHi: "हथबंद" },
          { id: "d9-a4-m3", nameEn: "बलौदाबाजार ग्रामीण", nameHi: "बलौदाबाजार ग्रामीण" },
          { id: "d9-a4-m4", nameEn: "बलौदाबाजार शहर", nameHi: "बलौदाबाजार शहर" },
        ],
      },
    ],
  },
  {
    id: "d10",
    nameEn: "Raipur Rural",
    nameHi: "रायपुर ग्रामीण",
    assemblies: [
      {
        id: "d10-a1",
        nameEn: "बलौदा बाजार",
        nameHi: "बलौदा बाजार",
        mandals: [
          { id: "d10-a1-m1", nameEn: "तिल्दा ग्रामीण", nameHi: "तिल्दा ग्रामीण" },
          { id: "d10-a1-m2", nameEn: "तिल्दा शहर", nameHi: "तिल्दा शहर" },
        ],
      },
      {
        id: "d10-a2",
        nameEn: "धरसींवा",
        nameHi: "धरसींवा",
        mandals: [
          { id: "d10-a2-m1", nameEn: "धरसींवा", nameHi: "धरसींवा" },
          { id: "d10-a2-m2", nameEn: "बोहरही धाम", nameHi: "बोहरही धाम" },
          { id: "d10-a2-m3", nameEn: "खरोरा", nameHi: "खरोरा" },
          { id: "d10-a2-m4", nameEn: "बंगोली", nameHi: "बंगोली" },
          { id: "d10-a2-m5", nameEn: "विधानसभा", nameHi: "विधानसभा" },
        ],
      },
      {
        id: "d10-a3",
        nameEn: "आरंग",
        nameHi: "आरंग",
        mandals: [
          { id: "d10-a3-m1", nameEn: "मंदिर हसौद", nameHi: "मंदिर हसौद" },
          { id: "d10-a3-m2", nameEn: "अटल नगर", nameHi: "अटल नगर" },
          { id: "d10-a3-m3", nameEn: "आरंग", nameHi: "आरंग" },
          { id: "d10-a3-m4", nameEn: "समोंदा", nameHi: "समोंदा" },
        ],
      },
      {
        id: "d10-a4",
        nameEn: "अभनपुर",
        nameHi: "अभनपुर",
        mandals: [
          { id: "d10-a4-m1", nameEn: "खोरपा", nameHi: "खोरपा" },
          { id: "d10-a4-m2", nameEn: "अभनपुर", nameHi: "अभनपुर" },
          { id: "d10-a4-m3", nameEn: "चम्पारण", nameHi: "चम्पारण" },
          { id: "d10-a4-m4", nameEn: "नवापारा", nameHi: "नवापारा" },
        ],
      },
    ],
  },
  {
    id: "d11",
    nameEn: "Korba",
    nameHi: "कोरबा",
    assemblies: [
      {
        id: "d11-a1",
        nameEn: "रामपुर",
        nameHi: "रामपुर",
        mandals: [
          { id: "d11-a1-m1", nameEn: "गढ़उपरोड़ा", nameHi: "गढ़उपरोड़ा" },
          { id: "d11-a1-m2", nameEn: "कूदमुरा", nameHi: "कूदमुरा" },
          { id: "d11-a1-m3", nameEn: "उरगा", nameHi: "उरगा" },
          { id: "d11-a1-m4", nameEn: "करतला", nameHi: "करतला" },
          { id: "d11-a1-m5", nameEn: "बरपाली", nameHi: "बरपाली" },
          { id: "d11-a1-m6", nameEn: "फरसवानी", nameHi: "फरसवानी" },
        ],
      },
      {
        id: "d11-a2",
        nameEn: "कोरबा",
        nameHi: "कोरबा",
        mandals: [
          { id: "d11-a2-m1", nameEn: "दर्री", nameHi: "दर्री" },
          { id: "d11-a2-m2", nameEn: "बाल्कोनगर", nameHi: "बाल्कोनगर" },
          { id: "d11-a2-m3", nameEn: "कोसाबाड़ी", nameHi: "कोसाबाड़ी" },
          { id: "d11-a2-m4", nameEn: "कोरबा", nameHi: "कोरबा" },
          { id: "d11-a2-m5", nameEn: "सर्वमंगला", nameHi: "सर्वमंगला" },
        ],
      },
      {
        id: "d11-a3",
        nameEn: "कटघोरा",
        nameHi: "कटघोरा",
        mandals: [
          { id: "d11-a3-m1", nameEn: "कटघोरा", nameHi: "कटघोरा" },
          { id: "d11-a3-m2", nameEn: "जवाली", nameHi: "जवाली" },
          { id: "d11-a3-m3", nameEn: "बांकीमोंगरा", nameHi: "बांकीमोंगरा" },
          { id: "d11-a3-m4", nameEn: "दीपका", nameHi: "दीपका" },
          { id: "d11-a3-m5", nameEn: "हरदीबाजार", nameHi: "हरदीबाजार" },
          { id: "d11-a3-m6", nameEn: "भिलाईबाजार", nameHi: "भिलाईबाजार" },
        ],
      },
      {
        id: "d11-a4",
        nameEn: "पाली-तानाखार",
        nameHi: "पाली-तानाखार",
        mandals: [
          { id: "d11-a4-m1", nameEn: "पाली", nameHi: "पाली" },
          { id: "d11-a4-m2", nameEn: "चैतमा", nameHi: "चैतमा" },
          { id: "d11-a4-m3", nameEn: "पोड़ी लाफा", nameHi: "पोड़ी लाफा" },
          { id: "d11-a4-m4", nameEn: "पसान", nameHi: "पसान" },
          { id: "d11-a4-m5", nameEn: "पोड़ीउपरोड़ा", nameHi: "पोड़ीउपरोड़ा" },
          { id: "d11-a4-m6", nameEn: "चोटिया", nameHi: "चोटिया" },
          { id: "d11-a4-m7", nameEn: "सिरमिना", nameHi: "सिरमिना" },
        ],
      },
    ],
  },
  {
    id: "d12",
    nameEn: "Gaurela-Pendra-Marwahi (GPM)",
    nameHi: "गौरेला पेण्ड्रा मरवाही",
    assemblies: [
      {
        id: "d12-a1",
        nameEn: "मरवाही",
        nameHi: "मरवाही",
        mandals: [
          { id: "d12-a1-m1", nameEn: "मरवाही दक्षिण", nameHi: "मरवाही दक्षिण" },
          { id: "d12-a1-m2", nameEn: "मरवाही उत्तर", nameHi: "मरवाही उत्तर" },
          { id: "d12-a1-m3", nameEn: "मरवाही मध्य", nameHi: "मरवाही मध्य" },
          { id: "d12-a1-m4", nameEn: "सेमरा", nameHi: "सेमरा" },
          { id: "d12-a1-m5", nameEn: "पेण्ड्रा ग्रामीण", nameHi: "पेण्ड्रा ग्रामीण" },
        ],
      },
      {
        id: "d12-a2",
        nameEn: "कोटा",
        nameHi: "कोटा",
        mandals: [
          { id: "d12-a2-m1", nameEn: "पेण्ड्रा नगर", nameHi: "पेण्ड्रा नगर" },
          { id: "d12-a2-m2", nameEn: "गौरेला", nameHi: "गौरेला" },
        ],
      },
    ],
  },
  {
    id: "d13",
    nameEn: "Bilaspur Rural",
    nameHi: "बिलासपुर ग्रामीण",
    assemblies: [
      {
        id: "d13-a1",
        nameEn: "कोटा",
        nameHi: "कोटा",
        mandals: [
          { id: "d13-a1-m1", nameEn: "बेलगहना", nameHi: "बेलगहना" },
          { id: "d13-a1-m2", nameEn: "रतनपुर", nameHi: "रतनपुर" },
          { id: "d13-a1-m3", nameEn: "कोटा", nameHi: "कोटा" },
          { id: "d13-a1-m4", nameEn: "करगीकला", nameHi: "करगीकला" },
        ],
      },
      {
        id: "d13-a2",
        nameEn: "बेलतरा",
        nameHi: "बेलतरा",
        mandals: [
          { id: "d13-a2-m1", nameEn: "बेलतरा उत्तर", nameHi: "बेलतरा उत्तर" },
          { id: "d13-a2-m2", nameEn: "बेलतरा दक्षिण", nameHi: "बेलतरा दक्षिण" },
          { id: "d13-a2-m3", nameEn: "बेलतरा पश्चिम", nameHi: "बेलतरा पश्चिम" },
          { id: "d13-a2-m4", nameEn: "बेलतरा पूर्व", nameHi: "बेलतरा पूर्व" },
        ],
      },
      {
        id: "d13-a3",
        nameEn: "मस्तुरी",
        nameHi: "मस्तुरी",
        mandals: [
          { id: "d13-a3-m1", nameEn: "सीपत", nameHi: "सीपत" },
          { id: "d13-a3-m2", nameEn: "जयरामनगर", nameHi: "जयरामनगर" },
          { id: "d13-a3-m3", nameEn: "मस्तूरी", nameHi: "मस्तूरी" },
          { id: "d13-a3-m4", nameEn: "देवरीखुर्द", nameHi: "देवरीखुर्द" },
          { id: "d13-a3-m5", nameEn: "मल्हार", nameHi: "मल्हार" },
          { id: "d13-a3-m6", nameEn: "लोहर्सी", nameHi: "लोहर्सी" },
        ],
      },
    ],
  },
  {
    id: "d14",
    nameEn: "Bilaspur City",
    nameHi: "बिलासपुर शहर",
    assemblies: [
      {
        id: "d14-a1",
        nameEn: "तखतपुर",
        nameHi: "तखतपुर",
        mandals: [
          { id: "d14-a1-m1", nameEn: "विजयपुर", nameHi: "विजयपुर" },
          { id: "d14-a1-m2", nameEn: "तखतपुर", nameHi: "तखतपुर" },
          { id: "d14-a1-m3", nameEn: "सकरी", nameHi: "सकरी" },
          { id: "d14-a1-m4", nameEn: "काठाकोनी", nameHi: "काठाकोनी" },
          { id: "d14-a1-m5", nameEn: "गनियारी", nameHi: "गनियारी" },
        ],
      },
      {
        id: "d14-a2",
        nameEn: "बिलासपुर",
        nameHi: "बिलासपुर",
        mandals: [
          { id: "d14-a2-m1", nameEn: "बिलासपुर उत्तर", nameHi: "बिलासपुर उत्तर" },
          { id: "d14-a2-m2", nameEn: "बिलासपुर पश्चिम", nameHi: "बिलासपुर पश्चिम" },
          { id: "d14-a2-m3", nameEn: "बिलासपुर दक्षिण", nameHi: "बिलासपुर दक्षिण" },
          { id: "d14-a2-m4", nameEn: "बिलासपुर मध्य", nameHi: "बिलासपुर मध्य" },
          { id: "d14-a2-m5", nameEn: "बिलासपुर पूर्वी", nameHi: "बिलासपुर पूर्वी" },
          { id: "d14-a2-m6", nameEn: "बिलासपुर रेल्वे", nameHi: "बिलासपुर रेल्वे" },
        ],
      },
      {
        id: "d14-a3",
        nameEn: "बिल्हा",
        nameHi: "बिल्हा",
        mandals: [
          { id: "d14-a3-m1", nameEn: "बिल्हा", nameHi: "बिल्हा" },
          { id: "d14-a3-m2", nameEn: "बोदरी", nameHi: "बोदरी" },
          { id: "d14-a3-m3", nameEn: "बरतोरी", nameHi: "बरतोरी" },
          { id: "d14-a3-m4", nameEn: "तिफरा-सिरगिट्टी", nameHi: "तिफरा-सिरगिट्टी" },
        ],
      },
    ],
  },
  {
    id: "d15",
    nameEn: "Mungeli",
    nameHi: "मुंगेली",
    assemblies: [
      {
        id: "d15-a1",
        nameEn: "बिल्हा",
        nameHi: "बिल्हा",
        mandals: [
          { id: "d15-a1-m1", nameEn: "पथरिया", nameHi: "पथरिया" },
          { id: "d15-a1-m2", nameEn: "सरगांव", nameHi: "सरगांव" },
        ],
      },
      {
        id: "d15-a2",
        nameEn: "लोरमी",
        nameHi: "लोरमी",
        mandals: [
          { id: "d15-a2-m1", nameEn: "गोड़खाम्ही", nameHi: "गोड़खाम्ही" },
          { id: "d15-a2-m2", nameEn: "लोरमी", nameHi: "लोरमी" },
          { id: "d15-a2-m3", nameEn: "डिंडौरी", nameHi: "डिंडौरी" },
          { id: "d15-a2-m4", nameEn: "देवरहट", nameHi: "देवरहट" },
        ],
      },
      {
        id: "d15-a3",
        nameEn: "मुंगेली",
        nameHi: "मुंगेली",
        mandals: [
          { id: "d15-a3-m1", nameEn: "सेतगंगा", nameHi: "सेतगंगा" },
          { id: "d15-a3-m2", nameEn: "मुंगेली नगर", nameHi: "मुंगेली नगर" },
          { id: "d15-a3-m3", nameEn: "मुंगेली ग्रामीण", nameHi: "मुंगेली ग्रामीण" },
          { id: "d15-a3-m4", nameEn: "जरहागांव", nameHi: "जरहागांव" },
          { id: "d15-a3-m5", nameEn: "लौदा", nameHi: "लौदा" },
        ],
      },
    ],
  },
  {
    id: "d16",
    nameEn: "Sakti",
    nameHi: "सक्ती",
    assemblies: [
      {
        id: "d16-a1",
        nameEn: "सक्ती",
        nameHi: "सक्ती",
        mandals: [
          { id: "d16-a1-m1", nameEn: "सारागांव", nameHi: "सारागांव" },
          { id: "d16-a1-m2", nameEn: "सिवनी", nameHi: "सिवनी" },
          { id: "d16-a1-m3", nameEn: "बाराद्वार", nameHi: "बाराद्वार" },
          { id: "d16-a1-m4", nameEn: "सक्ती ग्रामीण", nameHi: "सक्ती ग्रामीण" },
          { id: "d16-a1-m5", nameEn: "सक्ती नगर", nameHi: "सक्ती नगर" },
        ],
      },
      {
        id: "d16-a2",
        nameEn: "चन्द्रपुर",
        nameHi: "चन्द्रपुर",
        mandals: [
          { id: "d16-a2-m1", nameEn: "अड़भार", nameHi: "अड़भार" },
          { id: "d16-a2-m2", nameEn: "मालखरौदा", nameHi: "मालखरौदा" },
          { id: "d16-a2-m3", nameEn: "डभरा", nameHi: "डभरा" },
          { id: "d16-a2-m4", nameEn: "कोटमी", nameHi: "कोटमी" },
          { id: "d16-a2-m5", nameEn: "चन्द्रपुर", nameHi: "चन्द्रपुर" },
        ],
      },
      {
        id: "d16-a3",
        nameEn: "जैजैपुर",
        nameHi: "जैजैपुर",
        mandals: [
          { id: "d16-a3-m1", nameEn: "बम्हनीडीह", nameHi: "बम्हनीडीह" },
          { id: "d16-a3-m2", nameEn: "हसौद", nameHi: "हसौद" },
          { id: "d16-a3-m3", nameEn: "जैजैपुर", nameHi: "जैजैपुर" },
          { id: "d16-a3-m4", nameEn: "भोथिया", nameHi: "भोथिया" },
          { id: "d16-a3-m5", nameEn: "छपोरा", nameHi: "छपोरा" },
        ],
      },
    ],
  },
  {
    id: "d17",
    nameEn: "Janjgir-Champa",
    nameHi: "जांजगीर-चाम्पा",
    assemblies: [
      {
        id: "d17-a1",
        nameEn: "अकलतरा",
        nameHi: "अकलतरा",
        mandals: [
          { id: "d17-a1-m1", nameEn: "अकलतरा ग्रामीण", nameHi: "अकलतरा ग्रामीण" },
          { id: "d17-a1-m2", nameEn: "बलौदा", nameHi: "बलौदा" },
          { id: "d17-a1-m3", nameEn: "पहरिया", nameHi: "पहरिया" },
          { id: "d17-a1-m4", nameEn: "नरियरा", nameHi: "नरियरा" },
          { id: "d17-a1-m5", nameEn: "अकलतरा नगर", nameHi: "अकलतरा नगर" },
        ],
      },
      {
        id: "d17-a2",
        nameEn: "जांजगीर-चाम्पा",
        nameHi: "जांजगीर-चाम्पा",
        mandals: [
          { id: "d17-a2-m1", nameEn: "जांजगीर - ग्रामीण", nameHi: "जांजगीर - ग्रामीण" },
          { id: "d17-a2-m2", nameEn: "चांपा नगर", nameHi: "चांपा नगर" },
          { id: "d17-a2-m3", nameEn: "जांजगीर - नैला", nameHi: "जांजगीर - नैला" },
          { id: "d17-a2-m4", nameEn: "नवागढ़", nameHi: "नवागढ़" },
        ],
      },
      {
        id: "d17-a3",
        nameEn: "पामगढ़",
        nameHi: "पामगढ़",
        mandals: [
          { id: "d17-a3-m1", nameEn: "मुलमुला", nameHi: "मुलमुला" },
          { id: "d17-a3-m2", nameEn: "पामगढ़", nameHi: "पामगढ़" },
          { id: "d17-a3-m3", nameEn: "कोडाभाट", nameHi: "कोडाभाट" },
          { id: "d17-a3-m4", nameEn: "शिवरीनारायण", nameHi: "शिवरीनारायण" },
        ],
      },
    ],
  },
  {
    id: "d18",
    nameEn: "Mahasamund",
    nameHi: "महासमुन्द",
    assemblies: [
      {
        id: "d18-a1",
        nameEn: "सराईपाली",
        nameHi: "सराईपाली",
        mandals: [
          { id: "d18-a1-m1", nameEn: "भंवरपुर", nameHi: "भंवरपुर" },
          { id: "d18-a1-m2", nameEn: "केदुवां", nameHi: "केदुवां" },
          { id: "d18-a1-m3", nameEn: "सरायपाली", nameHi: "सरायपाली" },
          { id: "d18-a1-m4", nameEn: "छूहीपाली", nameHi: "छूहीपाली" },
          { id: "d18-a1-m5", nameEn: "बलौदा", nameHi: "बलौदा" },
        ],
      },
      {
        id: "d18-a2",
        nameEn: "बसना",
        nameHi: "बसना",
        mandals: [
          { id: "d18-a2-m1", nameEn: "पिथौरा शहर", nameHi: "पिथौरा शहर" },
          { id: "d18-a2-m2", nameEn: "सांकरा", nameHi: "सांकरा" },
          { id: "d18-a2-m3", nameEn: "पिरदा", nameHi: "पिरदा" },
          { id: "d18-a2-m4", nameEn: "बसना", nameHi: "बसना" },
          { id: "d18-a2-m5", nameEn: "गढ़फुलझर", nameHi: "गढ़फुलझर" },
        ],
      },
      {
        id: "d18-a3",
        nameEn: "खल्लारी",
        nameHi: "खल्लारी",
        mandals: [
          { id: "d18-a3-m1", nameEn: "खल्लारी", nameHi: "खल्लारी" },
          { id: "d18-a3-m2", nameEn: "बागबाहरा शहर", nameHi: "बागबाहरा शहर" },
          { id: "d18-a3-m3", nameEn: "कोमाखान", nameHi: "कोमाखान" },
          { id: "d18-a3-m4", nameEn: "बागबाहरा ग्रामीण", nameHi: "बागबाहरा ग्रामीण" },
          { id: "d18-a3-m5", nameEn: "पिथौरा ग्रामीण", nameHi: "पिथौरा ग्रामीण" },
        ],
      },
      {
        id: "d18-a4",
        nameEn: "महासमुन्द",
        nameHi: "महासमुन्द",
        mandals: [
          { id: "d18-a4-m1", nameEn: "तुमगांव", nameHi: "तुमगांव" },
          { id: "d18-a4-m2", nameEn: "झलप", nameHi: "झलप" },
          { id: "d18-a4-m3", nameEn: "महासमुंद ग्रामीण", nameHi: "महासमुंद ग्रामीण" },
          { id: "d18-a4-m4", nameEn: "सिरपुर पटेवा", nameHi: "सिरपुर पटेवा" },
          { id: "d18-a4-m5", nameEn: "महासमुंद शहर", nameHi: "महासमुंद शहर" },
        ],
      },
    ],
  },
  {
    id: "d19",
    nameEn: "Raipur City",
    nameHi: "रायपुर शहर",
    assemblies: [
      {
        id: "d19-a1",
        nameEn: "रायपुर ग्रामीण",
        nameHi: "रायपुर ग्रामीण",
        mandals: [
          { id: "d19-a1-m1", nameEn: "बीरगांव", nameHi: "बीरगांव" },
          { id: "d19-a1-m2", nameEn: "माँ बंजारी", nameHi: "माँ बंजारी" },
          { id: "d19-a1-m3", nameEn: "भनपुरी", nameHi: "भनपुरी" },
          { id: "d19-a1-m4", nameEn: "मोवा", nameHi: "मोवा" },
          { id: "d19-a1-m5", nameEn: "माना", nameHi: "माना" },
          { id: "d19-a1-m6", nameEn: "रायपुर ग्रामीण", nameHi: "रायपुर ग्रामीण" },
        ],
      },
      {
        id: "d19-a2",
        nameEn: "रायपुर शहर पश्चिम",
        nameHi: "रायपुर शहर पश्चिम",
        mandals: [
          { id: "d19-a2-m1", nameEn: "तात्यापारा", nameHi: "तात्यापारा" },
          { id: "d19-a2-m2", nameEn: "पं.दीनदयाल उपाध्याय", nameHi: "पं.दीनदयाल उपाध्याय" },
          { id: "d19-a2-m3", nameEn: "टाटीबंध", nameHi: "टाटीबंध" },
          { id: "d19-a2-m4", nameEn: "रामनगर", nameHi: "रामनगर" },
          { id: "d19-a2-m5", nameEn: "गुढियारी", nameHi: "गुढियारी" },
        ],
      },
      {
        id: "d19-a3",
        nameEn: "रायपुर शहर उत्तर",
        nameHi: "रायपुर शहर उत्तर",
        mandals: [
          { id: "d19-a3-m1", nameEn: "फाफाडीह", nameHi: "फाफाडीह" },
          { id: "d19-a3-m2", nameEn: "जवाहर नगर", nameHi: "जवाहर नगर" },
          { id: "d19-a3-m3", nameEn: "शंकर नगर", nameHi: "शंकर नगर" },
          { id: "d19-a3-m4", nameEn: "तेलीबांधा", nameHi: "तेलीबांधा" },
        ],
      },
      {
        id: "d19-a4",
        nameEn: "रायपुर शहर दक्षिण",
        nameHi: "रायपुर शहर दक्षिण",
        mandals: [
          { id: "d19-a4-m1", nameEn: "सदर बाजार", nameHi: "सदर बाजार" },
          { id: "d19-a4-m2", nameEn: "सिविल लाइन", nameHi: "सिविल लाइन" },
          { id: "d19-a4-m3", nameEn: "पुरानी बस्ती", nameHi: "पुरानी बस्ती" },
          { id: "d19-a4-m4", nameEn: "लाखे नगर", nameHi: "लाखे नगर" },
          { id: "d19-a4-m5", nameEn: "भाठागाँव", nameHi: "भाठागाँव" },
        ],
      },
    ],
  },
  {
    id: "d20",
    nameEn: "Gariaband",
    nameHi: "गरियाबंद",
    assemblies: [
      {
        id: "d20-a1",
        nameEn: "राजिम",
        nameHi: "राजिम",
        mandals: [
          { id: "d20-a1-m1", nameEn: "राजिम", nameHi: "राजिम" },
          { id: "d20-a1-m2", nameEn: "कोपरा", nameHi: "कोपरा" },
          { id: "d20-a1-m3", nameEn: "फिंगेश्वर", nameHi: "फिंगेश्वर" },
          { id: "d20-a1-m4", nameEn: "खड़मा", nameHi: "खड़मा" },
          { id: "d20-a1-m5", nameEn: "गरियाबंद", nameHi: "गरियाबंद" },
          { id: "d20-a1-m6", nameEn: "छुरा", nameHi: "छुरा" },
        ],
      },
      {
        id: "d20-a2",
        nameEn: "बिन्द्रानवागढ़",
        nameHi: "बिन्द्रानवागढ़",
        mandals: [
          { id: "d20-a2-m1", nameEn: "बिन्द्रानवागढ़", nameHi: "बिन्द्रानवागढ़" },
          { id: "d20-a2-m2", nameEn: "मलेवांचल", nameHi: "मलेवांचल" },
          { id: "d20-a2-m3", nameEn: "मैनपुर", nameHi: "मैनपुर" },
          { id: "d20-a2-m4", nameEn: "कांदाडोंगर", nameHi: "कांदाडोंगर" },
          { id: "d20-a2-m5", nameEn: "गोहरापदर", nameHi: "गोहरापदर" },
          { id: "d20-a2-m6", nameEn: "देवभोग", nameHi: "देवभोग" },
          { id: "d20-a2-m7", nameEn: "झाखरपारा", nameHi: "झाखरपारा" },
        ],
      },
    ],
  },
  {
    id: "d21",
    nameEn: "Dhamtari",
    nameHi: "धमतरी",
    assemblies: [
      {
        id: "d21-a1",
        nameEn: "सिहावा",
        nameHi: "सिहावा",
        mandals: [
          { id: "d21-a1-m1", nameEn: "कुकरेल", nameHi: "कुकरेल" },
          { id: "d21-a1-m2", nameEn: "मगरलोड", nameHi: "मगरलोड" },
          { id: "d21-a1-m3", nameEn: "नगरी", nameHi: "नगरी" },
          { id: "d21-a1-m4", nameEn: "बेलरगाँव", nameHi: "बेलरगाँव" },
        ],
      },
      {
        id: "d21-a2",
        nameEn: "कुरूद",
        nameHi: "कुरूद",
        mandals: [
          { id: "d21-a2-m1", nameEn: "भखारा", nameHi: "भखारा" },
          { id: "d21-a2-m2", nameEn: "सिर्री", nameHi: "सिर्री" },
          { id: "d21-a2-m3", nameEn: "कुरूद", nameHi: "कुरूद" },
          { id: "d21-a2-m4", nameEn: "मेघा", nameHi: "मेघा" },
        ],
      },
      {
        id: "d21-a3",
        nameEn: "धमतरी",
        nameHi: "धमतरी",
        mandals: [
          { id: "d21-a3-m1", nameEn: "आमदी", nameHi: "आमदी" },
          { id: "d21-a3-m2", nameEn: "धमतरी शहर", nameHi: "धमतरी शहर" },
          { id: "d21-a3-m3", nameEn: "भोथली", nameHi: "भोथली" },
          { id: "d21-a3-m4", nameEn: "रावां", nameHi: "रावां" },
          { id: "d21-a3-m5", nameEn: "गंगरेल", nameHi: "गंगरेल" },
        ],
      },
    ],
  },
  {
    id: "d22",
    nameEn: "Balod",
    nameHi: "बालोद",
    assemblies: [
      {
        id: "d22-a1",
        nameEn: "संजारी बालोद",
        nameHi: "संजारी बालोद",
        mandals: [
          { id: "d22-a1-m1", nameEn: "जुंगेरा", nameHi: "जुंगेरा" },
          { id: "d22-a1-m2", nameEn: "करही भदर", nameHi: "करही भदर" },
          { id: "d22-a1-m3", nameEn: "बालोद", nameHi: "बालोद" },
          { id: "d22-a1-m4", nameEn: "गुरूर", nameHi: "गुरूर" },
          { id: "d22-a1-m5", nameEn: "मिरीटोला पुरुर", nameHi: "मिरीटोला पुरुर" },
          { id: "d22-a1-m6", nameEn: "सनौद", nameHi: "सनौद" },
        ],
      },
      {
        id: "d22-a2",
        nameEn: "डौंडी लोहारा",
        nameHi: "डौंडी लोहारा",
        mandals: [
          { id: "d22-a2-m1", nameEn: "डौंडीलोहारा", nameHi: "डौंडीलोहारा" },
          { id: "d22-a2-m2", nameEn: "रेंगाडबरी", nameHi: "रेंगाडबरी" },
          { id: "d22-a2-m3", nameEn: "डौंडी", nameHi: "डौंडी" },
          { id: "d22-a2-m4", nameEn: "कुसुमकसा", nameHi: "कुसुमकसा" },
          { id: "d22-a2-m5", nameEn: "दल्लीराजहरा", nameHi: "दल्लीराजहरा" },
        ],
      },
      {
        id: "d22-a3",
        nameEn: "गुंडरदेही",
        nameHi: "गुंडरदेही",
        mandals: [
          { id: "d22-a3-m1", nameEn: "देवरी", nameHi: "देवरी" },
          { id: "d22-a3-m2", nameEn: "सुरेगाँव", nameHi: "सुरेगाँव" },
          { id: "d22-a3-m3", nameEn: "गुण्डरदेही", nameHi: "गुण्डरदेही" },
          { id: "d22-a3-m4", nameEn: "अर्जुन्दा", nameHi: "अर्जुन्दा" },
          { id: "d22-a3-m5", nameEn: "सिकोसा", nameHi: "सिकोसा" },
          { id: "d22-a3-m6", nameEn: "ओटेबंद", nameHi: "ओटेबंद" },
        ],
      },
    ],
  },
  {
    id: "d23",
    nameEn: "Durg",
    nameHi: "दुर्ग",
    assemblies: [
      {
        id: "d23-a1",
        nameEn: "पाटन",
        nameHi: "पाटन",
        mandals: [
          { id: "d23-a1-m1", nameEn: "कुम्हारी", nameHi: "कुम्हारी" },
          { id: "d23-a1-m2", nameEn: "अमलेश्वर", nameHi: "अमलेश्वर" },
          { id: "d23-a1-m3", nameEn: "पाटन", nameHi: "पाटन" },
          { id: "d23-a1-m4", nameEn: "जामगाँव (आर)", nameHi: "जामगाँव (आर)" },
          { id: "d23-a1-m5", nameEn: "दरबार मोखली", nameHi: "दरबार मोखली" },
        ],
      },
      {
        id: "d23-a2",
        nameEn: "दुर्ग ग्रामीण",
        nameHi: "दुर्ग ग्रामीण",
        mandals: [
          { id: "d23-a2-m1", nameEn: "अंजोरा", nameHi: "अंजोरा" },
          { id: "d23-a2-m2", nameEn: "उतई", nameHi: "उतई" },
          { id: "d23-a2-m3", nameEn: "अंडा निकुम", nameHi: "अंडा निकुम" },
          { id: "d23-a2-m4", nameEn: "रिसाली", nameHi: "रिसाली" },
          { id: "d23-a2-m5", nameEn: "मरोदा पुरैना", nameHi: "मरोदा पुरैना" },
        ],
      },
      {
        id: "d23-a3",
        nameEn: "दुर्ग शहर",
        nameHi: "दुर्ग शहर",
        mandals: [
          { id: "d23-a3-m1", nameEn: "चण्डी शीतला", nameHi: "चण्डी शीतला" },
          { id: "d23-a3-m2", nameEn: "सिकोला पटरीपार", nameHi: "सिकोला पटरीपार" },
          { id: "d23-a3-m3", nameEn: "सदर गौरवपथ", nameHi: "सदर गौरवपथ" },
          { id: "d23-a3-m4", nameEn: "कसारीडीह बोरसी", nameHi: "कसारीडीह बोरसी" },
          { id: "d23-a3-m5", nameEn: "मध्य मण्डल (पं. दीनदयाल उपाध्याय)", nameHi: "मध्य मण्डल (पं. दीनदयाल उपाध्याय)" },
        ],
      },
      {
        id: "d23-a4",
        nameEn: "साजा",
        nameHi: "साजा",
        mandals: [
          { id: "d23-a4-m1", nameEn: "धमधा", nameHi: "धमधा" },
          { id: "d23-a4-m2", nameEn: "बोरी लिटिया", nameHi: "बोरी लिटिया" },
        ],
      },
    ],
  },
  {
    id: "d24",
    nameEn: "Bemetara",
    nameHi: "बेमेतरा",
    assemblies: [
      {
        id: "d24-a1",
        nameEn: "साजा",
        nameHi: "साजा",
        mandals: [
          { id: "d24-a1-m1", nameEn: "थान खम्हरिया", nameHi: "थान खम्हरिया" },
          { id: "d24-a1-m2", nameEn: "साजा", nameHi: "साजा" },
          { id: "d24-a1-m3", nameEn: "परपोड़ी", nameHi: "परपोड़ी" },
        ],
      },
      {
        id: "d24-a2",
        nameEn: "बेमेतरा",
        nameHi: "बेमेतरा",
        mandals: [
          { id: "d24-a2-m1", nameEn: "बेमेतरा ग्रामीण", nameHi: "बेमेतरा ग्रामीण" },
          { id: "d24-a2-m2", nameEn: "बेमेतरा शहर", nameHi: "बेमेतरा शहर" },
          { id: "d24-a2-m3", nameEn: "बेरला", nameHi: "बेरला" },
          { id: "d24-a2-m4", nameEn: "देवरबीजा", nameHi: "देवरबीजा" },
          { id: "d24-a2-m5", nameEn: "सरदा", nameHi: "सरदा" },
          { id: "d24-a2-m6", nameEn: "भिंभौरी", nameHi: "भिंभौरी" },
        ],
      },
      {
        id: "d24-a3",
        nameEn: "नवागढ़",
        nameHi: "नवागढ़",
        mandals: [
          { id: "d24-a3-m1", nameEn: "मारो", nameHi: "मारो" },
          { id: "d24-a3-m2", nameEn: "नवागढ़", nameHi: "नवागढ़" },
          { id: "d24-a3-m3", nameEn: "खण्डसरा", nameHi: "खण्डसरा" },
          { id: "d24-a3-m4", nameEn: "बालसमुंद", nameHi: "बालसमुंद" },
        ],
      },
    ],
  },
  {
    id: "d25",
    nameEn: "Bhilai",
    nameHi: "भिलाई",
    assemblies: [
      {
        id: "d25-a1",
        nameEn: "अहिवारा",
        nameHi: "अहिवारा",
        mandals: [
          { id: "d25-a1-m1", nameEn: "चरोदा", nameHi: "चरोदा" },
          { id: "d25-a1-m2", nameEn: "भिलाई 3", nameHi: "भिलाई 3" },
          { id: "d25-a1-m3", nameEn: "जामुल", nameHi: "जामुल" },
          { id: "d25-a1-m4", nameEn: "अहिवारा", nameHi: "अहिवारा" },
          { id: "d25-a1-m5", nameEn: "मुरमुंदा", nameHi: "मुरमुंदा" },
          { id: "d25-a1-m6", nameEn: "जेवरा", nameHi: "जेवरा" },
        ],
      },
      {
        id: "d25-a2",
        nameEn: "भिलाई नगर",
        nameHi: "भिलाई नगर",
        mandals: [
          { id: "d25-a2-m1", nameEn: "भिलाई पश्चिम", nameHi: "भिलाई पश्चिम" },
          { id: "d25-a2-m2", nameEn: "भिलाई पूर्व", nameHi: "भिलाई पूर्व" },
          { id: "d25-a2-m3", nameEn: "खुर्सीपार", nameHi: "खुर्सीपार" },
        ],
      },
      {
        id: "d25-a3",
        nameEn: "वैशाली नगर",
        nameHi: "वैशाली नगर",
        mandals: [
          { id: "d25-a3-m1", nameEn: "सुपेला", nameHi: "सुपेला" },
          { id: "d25-a3-m2", nameEn: "कोहका", nameHi: "कोहका" },
          { id: "d25-a3-m3", nameEn: "वैशाली नगर", nameHi: "वैशाली नगर" },
          { id: "d25-a3-m4", nameEn: "कैम्प", nameHi: "कैम्प" },
        ],
      },
    ],
  },
  {
    id: "d26",
    nameEn: "Kabirdham",
    nameHi: "कबीरधाम",
    assemblies: [
      {
        id: "d26-a1",
        nameEn: "पंडरिया",
        nameHi: "पंडरिया",
        mandals: [
          { id: "d26-a1-m1", nameEn: "कुकदूर", nameHi: "कुकदूर" },
          { id: "d26-a1-m2", nameEn: "दुल्लापुर", nameHi: "दुल्लापुर" },
          { id: "d26-a1-m3", nameEn: "पंडरिया", nameHi: "पंडरिया" },
          { id: "d26-a1-m4", nameEn: "पांडातराई", nameHi: "पांडातराई" },
          { id: "d26-a1-m5", nameEn: "कुंडा", nameHi: "कुंडा" },
          { id: "d26-a1-m6", nameEn: "इंदौरी", nameHi: "इंदौरी" },
          { id: "d26-a1-m7", nameEn: "रणवीरपुर", nameHi: "रणवीरपुर" },
        ],
      },
      {
        id: "d26-a2",
        nameEn: "कवर्धा",
        nameHi: "कवर्धा",
        mandals: [
          { id: "d26-a2-m1", nameEn: "बोडला", nameHi: "बोडला" },
          { id: "d26-a2-m2", nameEn: "रेंगाखार जंगल", nameHi: "रेंगाखार जंगल" },
          { id: "d26-a2-m3", nameEn: "भोरमदेव", nameHi: "भोरमदेव" },
          { id: "d26-a2-m4", nameEn: "कवर्धा ग्रामीण", nameHi: "कवर्धा ग्रामीण" },
          { id: "d26-a2-m5", nameEn: "पिपरिया", nameHi: "पिपरिया" },
          { id: "d26-a2-m6", nameEn: "कवर्धा शहर", nameHi: "कवर्धा शहर" },
          { id: "d26-a2-m7", nameEn: "लोहरा", nameHi: "लोहरा" },
        ],
      },
    ],
  },
  {
    id: "d27",
    nameEn: "खैरागढ़-छुईखदान-गंडई",
    nameHi: "खैरागढ़-छुईखदान-गंडई",
    assemblies: [
      {
        id: "d27-a1",
        nameEn: "खैरागढ़",
        nameHi: "खैरागढ़",
        mandals: [
          { id: "d27-a1-m1", nameEn: "साल्हेवारा", nameHi: "साल्हेवारा" },
          { id: "d27-a1-m2", nameEn: "छुईखदान", nameHi: "छुईखदान" },
          { id: "d27-a1-m3", nameEn: "गंडई", nameHi: "गंडई" },
          { id: "d27-a1-m4", nameEn: "माँ नर्मदा", nameHi: "माँ नर्मदा" },
          { id: "d27-a1-m5", nameEn: "खैरागढ़", nameHi: "खैरागढ़" },
          { id: "d27-a1-m6", nameEn: "बाजार अतरिया", nameHi: "बाजार अतरिया" },
        ],
      },
      {
        id: "d27-a2",
        nameEn: "डोंगरगढ़",
        nameHi: "डोंगरगढ़",
        mandals: [
          { id: "d27-a2-m1", nameEn: "पांड़ादाह", nameHi: "पांड़ादाह" },
          { id: "d27-a2-m2", nameEn: "ठेलकाडीह", nameHi: "ठेलकाडीह" },
        ],
      },
    ],
  },
  {
    id: "d28",
    nameEn: "Rajnandgaon",
    nameHi: "राजनांदगांव",
    assemblies: [
      {
        id: "d28-a1",
        nameEn: "डोंगरगढ़",
        nameHi: "डोंगरगढ़",
        mandals: [
          { id: "d28-a1-m1", nameEn: "घुमका", nameHi: "घुमका" },
          { id: "d28-a1-m2", nameEn: "तिलई", nameHi: "तिलई" },
          { id: "d28-a1-m3", nameEn: "डोंगरगढ़ ग्रामीण", nameHi: "डोंगरगढ़ ग्रामीण" },
          { id: "d28-a1-m4", nameEn: "डोंगरगढ़ शहर", nameHi: "डोंगरगढ़ शहर" },
        ],
      },
      {
        id: "d28-a2",
        nameEn: "राजनांदगांव",
        nameHi: "राजनांदगांव",
        mandals: [
          { id: "d28-a2-m1", nameEn: "राजनांदगांव ग्रामीण पूर्व", nameHi: "राजनांदगांव ग्रामीण पूर्व" },
          { id: "d28-a2-m2", nameEn: "राजनांदगांव ग्रामीण पश्चिम", nameHi: "राजनांदगांव ग्रामीण पश्चिम" },
          { id: "d28-a2-m3", nameEn: "राजनांदगांव उत्तर", nameHi: "राजनांदगांव उत्तर" },
          { id: "d28-a2-m4", nameEn: "राजनांदगांव दक्षिण", nameHi: "राजनांदगांव दक्षिण" },
        ],
      },
      {
        id: "d28-a3",
        nameEn: "डोंगरगाँव",
        nameHi: "डोंगरगाँव",
        mandals: [
          { id: "d28-a3-m1", nameEn: "लालबहादुर नगर", nameHi: "लालबहादुर नगर" },
          { id: "d28-a3-m2", nameEn: "मुसरा-मुरमुंदा", nameHi: "मुसरा-मुरमुंदा" },
          { id: "d28-a3-m3", nameEn: "डोंगरगांव", nameHi: "डोंगरगांव" },
          { id: "d28-a3-m4", nameEn: "अर्जुनी", nameHi: "अर्जुनी" },
          { id: "d28-a3-m5", nameEn: "तुमड़ीबोड़", nameHi: "तुमड़ीबोड़" },
        ],
      },
      {
        id: "d28-a4",
        nameEn: "खुज्जी",
        nameHi: "खुज्जी",
        mandals: [
          { id: "d28-a4-m1", nameEn: "छुरिया", nameHi: "छुरिया" },
          { id: "d28-a4-m2", nameEn: "कुमर्दा", nameHi: "कुमर्दा" },
          { id: "d28-a4-m3", nameEn: "गैंदाटोला", nameHi: "गैंदाटोला" },
        ],
      },
    ],
  },
  {
    id: "d29",
    nameEn: "मोहला-मानपुर-अंबागढ़ चौकी",
    nameHi: "मोहला-मानपुर-अंबागढ़ चौकी",
    assemblies: [
      {
        id: "d29-a1",
        nameEn: "खुज्जी",
        nameHi: "खुज्जी",
        mandals: [
          { id: "d29-a1-m1", nameEn: "अं.चौकी", nameHi: "अं.चौकी" },
        ],
      },
      {
        id: "d29-a2",
        nameEn: "मोहला-मानपुर",
        nameHi: "मोहला-मानपुर",
        mandals: [
          { id: "d29-a2-m1", nameEn: "कौड़ीकसा", nameHi: "कौड़ीकसा" },
          { id: "d29-a2-m2", nameEn: "मोहला", nameHi: "मोहला" },
          { id: "d29-a2-m3", nameEn: "गोटाटोला", nameHi: "गोटाटोला" },
          { id: "d29-a2-m4", nameEn: "मानपुर", nameHi: "मानपुर" },
          { id: "d29-a2-m5", nameEn: "औंधी", nameHi: "औंधी" },
        ],
      },
    ],
  },
  {
    id: "d30",
    nameEn: "Kanker",
    nameHi: "कांकेर",
    assemblies: [
      {
        id: "d30-a1",
        nameEn: "अंतागढ़",
        nameHi: "अंतागढ़",
        mandals: [
          { id: "d30-a1-m1", nameEn: "पंखाजूर", nameHi: "पंखाजूर" },
          { id: "d30-a1-m2", nameEn: "कापसी", nameHi: "कापसी" },
          { id: "d30-a1-m3", nameEn: "बांदे", nameHi: "बांदे" },
          { id: "d30-a1-m4", nameEn: "कोयलीबेडा", nameHi: "कोयलीबेडा" },
          { id: "d30-a1-m5", nameEn: "अंतागढ़", nameHi: "अंतागढ़" },
          { id: "d30-a1-m6", nameEn: "आमाबेड़ा", nameHi: "आमाबेड़ा" },
        ],
      },
      {
        id: "d30-a2",
        nameEn: "भानुप्रतापपुर",
        nameHi: "भानुप्रतापपुर",
        mandals: [
          { id: "d30-a2-m1", nameEn: "दुर्गुकोंदल", nameHi: "दुर्गुकोंदल" },
          { id: "d30-a2-m2", nameEn: "भानुप्रतापपुर", nameHi: "भानुप्रतापपुर" },
          { id: "d30-a2-m3", nameEn: "कोरर", nameHi: "कोरर" },
          { id: "d30-a2-m4", nameEn: "चारामा", nameHi: "चारामा" },
          { id: "d30-a2-m5", nameEn: "हाराडुला", nameHi: "हाराडुला" },
        ],
      },
      {
        id: "d30-a3",
        nameEn: "कांकेर",
        nameHi: "कांकेर",
        mandals: [
          { id: "d30-a3-m1", nameEn: "धनेली कन्हार", nameHi: "धनेली कन्हार" },
          { id: "d30-a3-m2", nameEn: "कांकेर ग्रामीण", nameHi: "कांकेर ग्रामीण" },
          { id: "d30-a3-m3", nameEn: "कांकेर शहर", nameHi: "कांकेर शहर" },
          { id: "d30-a3-m4", nameEn: "नरहरपुर", nameHi: "नरहरपुर" },
          { id: "d30-a3-m5", nameEn: "सरोना", nameHi: "सरोना" },
        ],
      },
    ],
  },
  {
    id: "d31",
    nameEn: "Kondagaon",
    nameHi: "कोंडागांव",
    assemblies: [
      {
        id: "d31-a1",
        nameEn: "केशकाल",
        nameHi: "केशकाल",
        mandals: [
          { id: "d31-a1-m1", nameEn: "केशकाल", nameHi: "केशकाल" },
          { id: "d31-a1-m2", nameEn: "बड़े डोंगर", nameHi: "बड़े डोंगर" },
          { id: "d31-a1-m3", nameEn: "धनोरा", nameHi: "धनोरा" },
          { id: "d31-a1-m4", nameEn: "विश्रामपुरी", nameHi: "विश्रामपुरी" },
          { id: "d31-a1-m5", nameEn: "बड़ेराजपुर", nameHi: "बड़ेराजपुर" },
          { id: "d31-a1-m6", nameEn: "फरसगांव", nameHi: "फरसगांव" },
        ],
      },
      {
        id: "d31-a2",
        nameEn: "कोंडागांव",
        nameHi: "कोंडागांव",
        mandals: [
          { id: "d31-a2-m1", nameEn: "कोंडागांव उत्तर", nameHi: "कोंडागांव उत्तर" },
          { id: "d31-a2-m2", nameEn: "माकड़ी", nameHi: "माकड़ी" },
          { id: "d31-a2-m3", nameEn: "बीजापुर", nameHi: "बीजापुर" },
          { id: "d31-a2-m4", nameEn: "कोंडागांव शहर", nameHi: "कोंडागांव शहर" },
          { id: "d31-a2-m5", nameEn: "कोंडागांव दक्षिण", nameHi: "कोंडागांव दक्षिण" },
        ],
      },
      {
        id: "d31-a3",
        nameEn: "नारायणपुर",
        nameHi: "नारायणपुर",
        mandals: [
          { id: "d31-a3-m1", nameEn: "मर्दापाल", nameHi: "मर्दापाल" },
        ],
      },
    ],
  },
  {
    id: "d32",
    nameEn: "Narayanpur",
    nameHi: "नारायणपुर",
    assemblies: [
      {
        id: "d32-a1",
        nameEn: "नारायणपुर",
        nameHi: "नारायणपुर",
        mandals: [
          { id: "d32-a1-m1", nameEn: "ओरछा", nameHi: "ओरछा" },
          { id: "d32-a1-m2", nameEn: "नारायणपुर ग्रामीण", nameHi: "नारायणपुर ग्रामीण" },
          { id: "d32-a1-m3", nameEn: "नारायणपुर शहर", nameHi: "नारायणपुर शहर" },
        ],
      },
    ],
  },
  {
    id: "d33",
    nameEn: "Bastar",
    nameHi: "बस्तर",
    assemblies: [
      {
        id: "d33-a1",
        nameEn: "नारायणपुर",
        nameHi: "नारायणपुर",
        mandals: [
          { id: "d33-a1-m1", nameEn: "भानपुरी", nameHi: "भानपुरी" },
        ],
      },
      {
        id: "d33-a2",
        nameEn: "बस्तर",
        nameHi: "बस्तर",
        mandals: [
          { id: "d33-a2-m1", nameEn: "करपावंड", nameHi: "करपावंड" },
          { id: "d33-a2-m2", nameEn: "बकावण्ड", nameHi: "बकावण्ड" },
          { id: "d33-a2-m3", nameEn: "सरगीपाल", nameHi: "सरगीपाल" },
          { id: "d33-a2-m4", nameEn: "बस्तर", nameHi: "बस्तर" },
        ],
      },
      {
        id: "d33-a3",
        nameEn: "जगदलपुर",
        nameHi: "जगदलपुर",
        mandals: [
          { id: "d33-a3-m1", nameEn: "नगरनार", nameHi: "नगरनार" },
          { id: "d33-a3-m2", nameEn: "जगदलपुर पूर्वी", nameHi: "जगदलपुर पूर्वी" },
          { id: "d33-a3-m3", nameEn: "जगदलपुर पश्चिम", nameHi: "जगदलपुर पश्चिम" },
          { id: "d33-a3-m4", nameEn: "नानगुर", nameHi: "नानगुर" },
        ],
      },
      {
        id: "d33-a4",
        nameEn: "चित्रकोट",
        nameHi: "चित्रकोट",
        mandals: [
          { id: "d33-a4-m1", nameEn: "दरभा", nameHi: "दरभा" },
          { id: "d33-a4-m2", nameEn: "लोहन्डीगुड़ा", nameHi: "लोहन्डीगुड़ा" },
          { id: "d33-a4-m3", nameEn: "तोकापाल", nameHi: "तोकापाल" },
          { id: "d33-a4-m4", nameEn: "बास्तानार", nameHi: "बास्तानार" },
        ],
      },
    ],
  },
  {
    id: "d34",
    nameEn: "दंतेवाड़ा",
    nameHi: "दंतेवाड़ा",
    assemblies: [
      {
        id: "d34-a1",
        nameEn: "दंतेवाडा",
        nameHi: "दंतेवाडा",
        mandals: [
          { id: "d34-a1-m1", nameEn: "बारसुर", nameHi: "बारसुर" },
          { id: "d34-a1-m2", nameEn: "गीदम", nameHi: "गीदम" },
          { id: "d34-a1-m3", nameEn: "दंतेवाड़ा", nameHi: "दंतेवाड़ा" },
          { id: "d34-a1-m4", nameEn: "बचेली", nameHi: "बचेली" },
          { id: "d34-a1-m5", nameEn: "कुआकोण्डा", nameHi: "कुआकोण्डा" },
          { id: "d34-a1-m6", nameEn: "कटेकल्याण", nameHi: "कटेकल्याण" },
          { id: "d34-a1-m7", nameEn: "किरन्दुल", nameHi: "किरन्दुल" },
        ],
      },
    ],
  },
  {
    id: "d35",
    nameEn: "Bijapur",
    nameHi: "बीजापुर",
    assemblies: [
      {
        id: "d35-a1",
        nameEn: "बीजापुर",
        nameHi: "बीजापुर",
        mandals: [
          { id: "d35-a1-m1", nameEn: "भोपालपटनम", nameHi: "भोपालपटनम" },
          { id: "d35-a1-m2", nameEn: "कुटरू", nameHi: "कुटरू" },
          { id: "d35-a1-m3", nameEn: "बीजापुर", nameHi: "बीजापुर" },
          { id: "d35-a1-m4", nameEn: "उसूर", nameHi: "उसूर" },
          { id: "d35-a1-m5", nameEn: "भैरमगढ़", nameHi: "भैरमगढ़" },
        ],
      },
    ],
  },
  {
    id: "d36",
    nameEn: "Sukma",
    nameHi: "सुकमा",
    assemblies: [
      {
        id: "d36-a1",
        nameEn: "कोंटा",
        nameHi: "कोंटा",
        mandals: [
          { id: "d36-a1-m1", nameEn: "दोरनापाल", nameHi: "दोरनापाल" },
          { id: "d36-a1-m2", nameEn: "सुकमा", nameHi: "सुकमा" },
          { id: "d36-a1-m3", nameEn: "छिन्दगढ", nameHi: "छिन्दगढ" },
          { id: "d36-a1-m4", nameEn: "कोन्टा", nameHi: "कोन्टा" },
          { id: "d36-a1-m5", nameEn: "तोंगपाल", nameHi: "तोंगपाल" },
        ],
      },
    ],
  },
];

// ---- Lookup helpers ----

export function getAssemblies(districtId: string): Assembly[] {
  return HIERARCHY.find((d) => d.id === districtId)?.assemblies ?? [];
}

export function getMandals(districtId: string, assemblyId: string): Mandal[] {
  return getAssemblies(districtId).find((a) => a.id === assemblyId)?.mandals ?? [];
}

export function findHierarchyLabels(districtId?: string | null, assemblyId?: string | null, mandalId?: string | null) {
  const d = HIERARCHY.find((x) => x.id === districtId);
  const a = d?.assemblies.find((x) => x.id === assemblyId);
  const m = a?.mandals.find((x) => x.id === mandalId);
  return {
    district: d ? { en: d.nameEn, hi: d.nameHi } : null,
    assembly: a ? { en: a.nameEn, hi: a.nameHi } : null,
    mandal: m ? { en: m.nameEn, hi: m.nameHi } : null,
  };
}

// ---- Category (Varg) — hardcoded per spec ----

export const CATEGORIES = [
  { id: "General", nameEn: "General", nameHi: "सामान्य (GEN)" },
  { id: "OBC", nameEn: "OBC", nameHi: "अन्य पिछड़ा वर्ग (OBC)" },
  { id: "SC", nameEn: "SC", nameHi: "अनुसूचित जाति (SC)" },
  { id: "ST", nameEn: "ST", nameHi: "अनुसूचित जनजाति (ST)" },
  // { id: "EWS", nameEn: "EWS", nameHi: "आर्थिक रूप से कमजोर वर्ग (EWS)" },
  // { id: "Other", nameEn: "Other", nameHi: "अन्य" },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]["id"];