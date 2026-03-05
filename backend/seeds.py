import sys
import os

sys.stdout.reconfigure(encoding='utf-8')
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import SessionLocal, engine
from models import Location, Quote, Base
from nlp_service import nlp_layer

# ── Author bios (Marathi) — keyed by author name ──────────────────────────
AUTHOR_BIOS: dict[str, str] = {
    "Pu La Deshpande":
        "पु. ल. देशपांडे — महाराष्ट्राचे लाडके व्यक्तिमत्व. विनोदी लेखक, नाटककार, संगीतप्रेमी आणि माणूसप्रेमी. "
        "'व्यक्ती आणि वल्ली', 'अपूर्वाई', 'बटाट्याची चाळ' यांसारख्या कृतींनी मराठी मनावर अमीट छाप सोडली.",

    "V. P. Kale":
        "व. पु. काळे — मराठी साहित्यातील एक संवेदनशील आणि मार्मिक लेखक. 'रणांगण' आणि 'पानगळ' "
        "यांसारख्या कादंबऱ्यांमधून त्यांनी माणसाच्या भावनांचे खोल चित्रण केले.",

    "Vinda Karandikar":
        "विंदा करंदीकर — ज्ञानपीठ पुरस्कारप्राप्त मराठी कवी. त्यांची कविता निसर्गाशी आणि माणसाशी "
        "एकरूप होणारी, तर्कसंगत आणि तरीही हृदयस्पर्शी आहे. 'ध्रुपद' हा त्यांचा महत्त्वाचा काव्यसंग्रह.",

    "B. S. Mardhekar":
        "बा. सी. मर्ढेकर — आधुनिक मराठी कवितेचे जनक. त्यांच्या कवितांमध्ये शहरी एकाकीपणा, "
        "अस्तित्वाचे प्रश्न आणि प्रतिमावादी भाषा यांचा अनोखा संगम दिसतो.",

    "G. A. Kulkarni":
        "ग. आ. कुलकर्णी — रहस्यमय आणि प्रतीकात्मक कथा लिहिणारे मराठीतील अद्वितीय लेखक. "
        "'पिंगळावेळ' आणि 'काजळमाया' यांसारख्या कथासंग्रहांनी मराठी साहित्याला एक वेगळी दिशा दिली.",

    "Acharya Atre":
        "आचार्य अत्रे — विनोदवीर, नाटककार, पत्रकार आणि वक्ते. 'नवयुग', 'मराठा' यांसारख्या वृत्तपत्रांतून "
        "त्यांनी महाराष्ट्राच्या सामाजिक आणि राजकीय जीवनावर प्रखर टीका केली.",

    "Narayan Surve":
        "नारायण सुर्वे — मुंबईच्या गिरणी कामगारांचे कवी. त्यांची कविता श्रमजीवी माणसाची व्यथा, "
        "जिद्द आणि स्वाभिमान यांचे दाहक चित्रण करते. 'माझे विद्यापीठ' हा त्यांचा गाजलेला काव्यसंग्रह.",

    "Lokmanya Bal Gangadhar Tilak":
        "लोकमान्य बाळ गंगाधर टिळक — भारताच्या स्वातंत्र्य लढ्यातील एक अग्रणी नेते. "
        "'स्वराज्य हा माझा जन्मसिद्ध हक्क आहे' हे त्यांचे घोषवाक्य आजही प्रेरणा देते. "
        "गणेशोत्सव आणि शिवजयंती यांच्या माध्यमातून त्यांनी समाजाला एकत्र आणले.",

    "Savitribai Phule":
        "सावित्रीबाई फुले — भारतातील पहिल्या महिला शिक्षिका आणि समाजसुधारक. स्त्री-शिक्षणाचा पाया "
        "रचणाऱ्या सावित्रीबाईंनी जोतिबा फुले यांच्यासमवेत सामाजिक क्रांतीचे कार्य केले. "
        "'काव्यफुले' हा त्यांचा काव्यसंग्रह मराठी साहित्याचा अनमोल ठेवा आहे.",

    "Babasaheb Purandare":
        "बाबासाहेब पुरंदरे — महाराष्ट्राचे 'शिवशाहीर'. छत्रपती शिवाजी महाराजांचे चरित्र "
        "सर्वसामान्यांपर्यंत पोहोचवण्याचे महान कार्य त्यांनी केले. 'राजा शिवछत्रपती' "
        "हे त्यांचे महाकाय ग्रंथकार्य अजरामर आहे.",

    "Dilip Chitre":
        "दिलीप चित्रे — मराठी आणि इंग्रजी या दोन्ही भाषांतील प्रतिभावंत कवी आणि चित्रकार. "
        "त्यांनी ज्ञानेश्वरांच्या अभंगांचे इंग्रजी भाषांतर केले. आधुनिक मराठी कवितेत त्यांचे स्थान अनन्यसाधारण आहे.",

    "Vyankatesh Madgulkar":
        "व्यंकटेश माडगूळकर — ग्रामीण महाराष्ट्राचे हळव्या नजरेने चित्रण करणारे लेखक. "
        "'बनगरवाडी' ही त्यांची कादंबरी मराठी ग्रामीण जीवनाचे अप्रतिम दर्शन घडवते.",
}

print("Resetting database schema...")
Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)

# ─────────────────────────────────────────────────────────────────────────────
# traits: "Historic" | "Educational" | "Nature" | "Katta Culture"
# ─────────────────────────────────────────────────────────────────────────────
locations_data = [

    # ══ ORIGINAL 32 — now with trait ════════════════════════════════════════

    {"name": "Shanivar Wada", "latitude": 18.5195, "longitude": 73.8553, "trait": "Historic",
     "quotes": [
        {"text": "इतिहासाची पाने उलटताना आजही शनिवारवाड्याच्या भिंतीतून घोड्यांच्या टापांचा आवाज ऐकू येतो.",
         "author": "Pune Folklore", "sentiment": "Historical/Serious", "reference_book": "Pune Lokkathasangrah"},
        {"text": "शनिवारवाड्याच्या दरवाज्यासमोर उभा राहिलो आणि विचार केला — पेशव्यांनी इथे तिकीट लावले असते, तर किती श्रीमंत झाले असते!",
         "author": "Pu La Deshpande", "sentiment": "Humorous", "reference_book": "Apurvaai"},
        {"text": "दगडांनाही स्मृती असते, भिंतींनाही श्वास — शनिवारवाड्याची माती बोलते रात्री एकट्याने.",
         "author": "B. S. Mardhekar", "sentiment": "Nature/Poetic", "reference_book": "Kahi Kavita"},
    ]},

    {"name": "Saras Baug", "latitude": 18.5043, "longitude": 73.8559, "trait": "Historic",
     "quotes": [
        {"text": "सारस बागेत श्री गणेशाच्या चरणी बसणे म्हणजे पुण्यातील सर्वात शांत अनुभव.",
         "author": "Devotional Tradition", "sentiment": "Spiritual/Grand", "reference_book": "Ganesh Purana ani Pune"},
        {"text": "पुण्यात गणपती नाही असे एखादे घर सापडेल, पण पुण्यात आनंद नाही असे घर सापडणार नाही.",
         "author": "Acharya Atre", "sentiment": "Joyful/Cultural", "reference_book": "Srimantyanchi Taraf"},
        {"text": "सारसाचे पाणी, देवाची सावली — इथे माझे मन रिकामे होते आणि भरतेही.",
         "author": "Vinda Karandikar", "sentiment": "Nature/Poetic", "reference_book": "Dhrupad"},
    ]},

    {"name": "FC Road", "latitude": 18.5261, "longitude": 73.8441, "trait": "Katta Culture",
     "quotes": [
        {"text": "पुणेकर हे जगातील अशी एकमेव जमात आहे जी झोपेतही जगाचा विचार करू शकते.",
         "author": "Pu La Deshpande", "sentiment": "Humorous", "reference_book": "Vyakti ani Valli"},
    ]},

    {"name": "Chitale Bandhu", "latitude": 18.5168, "longitude": 73.8519, "trait": "Katta Culture",
     "quotes": [
        {"text": "चितळेंची बाकरवडी म्हणजे पुण्याची ओळख, आणि दुपारी १ ते ४ झोपणे हा पुण्याचा धर्म!",
         "author": "Puneri Culture", "sentiment": "Humorous", "reference_book": "Purachi Puneri"},
    ]},

    {"name": "Vetal Tekdi", "latitude": 18.5283, "longitude": 73.8166, "trait": "Nature",
     "quotes": [
        {"text": "निसर्गाच्या कुशीत विसावलेला निसर्गरम्य वेळ म्हणजे स्वतःला नव्याने शोधण्याची संधी.",
         "author": "V. P. Kale", "sentiment": "Nature/Poetic", "reference_book": "Ranangan"},
    ]},

    {"name": "Dagdusheth Halwai Ganpati", "latitude": 18.5164, "longitude": 73.8562, "trait": "Historic",
     "quotes": [
        {"text": "श्रीमंत दगडूशेठ हलवाई गणपती म्हणजे पुण्याचे आराध्य दैवत आणि भक्तांचा खंबीर आधार.",
         "author": "Devotional Tradition", "sentiment": "Spiritual/Grand", "reference_book": "Ganesh Purana ani Pune"},
    ]},

    {"name": "Raja Dinkar Kelkar Museum", "latitude": 18.5154, "longitude": 73.8567, "trait": "Historic",
     "quotes": [
        {"text": "वस्तू बोलतात — ज्याला ऐकता येते त्याला इतिहासाची भाषा समजते.",
         "author": "Keshavsut", "sentiment": "Historical/Serious", "reference_book": "Manasi"},
    ]},

    {"name": "Pu La Deshpande Garden", "latitude": 18.5036, "longitude": 73.8724, "trait": "Nature",
     "quotes": [
        {"text": "माणूस हसवणे हे देखील एक प्रकारचे ईश्वरी काम आहे — आणि ते करणारा पुलं एकमेव होता.",
         "author": "Pu La Deshpande", "sentiment": "Humorous", "reference_book": "Vyakti ani Valli"},
    ]},

    {"name": "Balgandharva Rang Mandir", "latitude": 18.5236, "longitude": 73.8478, "trait": "Katta Culture",
     "quotes": [
        {"text": "रंगमंचावर जे घडते ते केवळ नाटक नसते — ते एका काळाची धडपड असते.",
         "author": "Vishram Bedekar", "sentiment": "Artistic/Reflective", "reference_book": "Ranaangan"},
    ]},

    {"name": "Koregaon Park", "latitude": 18.5362, "longitude": 73.8937, "trait": "Katta Culture",
     "quotes": [
        {"text": "मुंबईत जन्मलो, पण पुण्यात माझा आत्मा घडला — उन्हाळ्याच्या सावलीत आणि चहाच्या कपात.",
         "author": "Narayan Surve", "sentiment": "Nostalgic/Urban", "reference_book": "Majhe Vidyapeeth"},
    ]},

    {"name": "Kasba Ganpati — Kasba Peth", "latitude": 18.5225, "longitude": 73.8573, "trait": "Historic",
     "quotes": [
        {"text": "काशी विश्वेश्वर, पुण्यात कसबा — हे दोन्ही ठिकाणे माझ्या आस्थेचे केंद्र.",
         "author": "Lokmanya Tilak", "sentiment": "Spiritual/Grand", "reference_book": "Kesari Lekh"},
        {"text": "कसब्यातील गल्ल्यांमध्ये फिरताना जाणवते की इतिहास इथे रोज जगतो.",
         "author": "N. C. Kelkar", "sentiment": "Historical/Serious", "reference_book": "Maratha Itihas"},
    ]},

    {"name": "Tilak Smarak Mandir — Sadashiv Peth", "latitude": 18.5128, "longitude": 73.8474, "trait": "Historic",
     "quotes": [
        {"text": "स्वराज्य हा माझा जन्मसिद्ध हक्क आहे आणि तो मी मिळवणारच.",
         "author": "Lokmanya Bal Gangadhar Tilak", "sentiment": "Historical/Serious", "reference_book": "Kesari — 1907"},
        {"text": "टिळकांच्या पुतळ्यासमोर उभे राहिलो — आणि मला वाटले, आपण काय केले आजपर्यंत?",
         "author": "Pu La Deshpande", "sentiment": "Humorous", "reference_book": "Apurvaai"},
    ]},

    {"name": "Natu Baug — Narayan Peth", "latitude": 18.5145, "longitude": 73.8510, "trait": "Historic",
     "quotes": [
        {"text": "नारायण पेठेतील सकाळ म्हणजे चहाचा सुगंध, पेपरचा आवाज, आणि जगाललगत थांबलेला एक क्षण.",
         "author": "G. A. Kulkarni", "sentiment": "Nostalgic/Urban", "reference_book": "Pinglavel"},
    ]},

    {"name": "Budhwar Peth", "latitude": 18.5175, "longitude": 73.8543, "trait": "Katta Culture",
     "quotes": [
        {"text": "बुधवार पेठेतील बाजार म्हणजे पुण्यातील जिवंत रक्तवाहिनी — इथे पैसा नाही बोलत, माणूस बोलतो.",
         "author": "Vyankatesh Madgulkar", "sentiment": "Joyful/Cultural", "reference_book": "Bangarwadi"},
    ]},

    {"name": "Parvati Hill — Shukrawar Peth", "latitude": 18.5029, "longitude": 73.8490, "trait": "Nature",
     "quotes": [
        {"text": "पर्वतीच्या शिखरावरून पुणे पाहिले की कळते — हे शहर किती आपले आहे.",
         "author": "Vinda Karandikar", "sentiment": "Nature/Poetic", "reference_book": "Dhrupad"},
        {"text": "पर्वतीवर चढताना घाम येतो, पण उतरताना समजते — प्रत्येक चढाई एक नवी दृष्टी देते.",
         "author": "Pu La Deshpande", "sentiment": "Humorous", "reference_book": "Vyakti ani Valli"},
    ]},

    {"name": "Omkareshwar Temple — Somwar Peth", "latitude": 18.5240, "longitude": 73.8610, "trait": "Historic",
     "quotes": [
        {"text": "मुला नदीच्या काठावर ओंकारेश्वर उभा आहे — निशब्द, शांत, काळाच्या पलीकडे.",
         "author": "Vishnu Sakharam Khandekar", "sentiment": "Spiritual/Grand", "reference_book": "Yayati"},
    ]},

    {"name": "Mangalwar Peth — Mutha Riverfront", "latitude": 18.5202, "longitude": 73.8620, "trait": "Nature",
     "quotes": [
        {"text": "मुठेच्या पाण्यात पुण्याचे प्रतिबिंब — धुके असताना शहर आणखी सुंदर दिसते.",
         "author": "B. S. Mardhekar", "sentiment": "Nature/Poetic", "reference_book": "Kahi Kavita"},
    ]},

    {"name": "Mahatma Phule Mandai — Ganj Peth", "latitude": 18.5199, "longitude": 73.8584, "trait": "Historic",
     "quotes": [
        {"text": "मंडईत उभे राहिले की वाटते — इथे खरेदी नाही होत, माणसे जोडली जातात.",
         "author": "Mahatma Jyotirao Phule", "sentiment": "Joyful/Cultural", "reference_book": "Gulamgiri"},
        {"text": "फुलांच्या रांगेत मी भाजी विसरलो, आणि बायकोने मला — मंडईत जाऊ नको हे विसरलो.",
         "author": "Pu La Deshpande", "sentiment": "Humorous", "reference_book": "Apurvaai"},
    ]},

    {"name": "Aga Khan Palace — Ravivar Peth", "latitude": 18.5523, "longitude": 73.9014, "trait": "Historic",
     "quotes": [
        {"text": "आगा खान पॅलेसमध्ये बापूंचे अस्तित्व आजही जाणवते — एक शांत, खोल, अटल शक्ती.",
         "author": "Mahadev Desai", "sentiment": "Historical/Serious", "reference_book": "The Diary of Mahadev Desai"},
        {"text": "स्वातंत्र्याची किंमत या भिंतींनी मोजली — इथे नजरकैद होणे म्हणजे जगाचे लक्ष वेधणे.",
         "author": "Jawaharlal Nehru", "sentiment": "Historical/Serious", "reference_book": "Discovery of India"},
    ]},

    {"name": "Magarpatta City — Hadapsar", "latitude": 18.5147, "longitude": 73.9279, "trait": "Educational",
     "quotes": [
        {"text": "शेतकऱ्यांनी एकत्र येऊन शहर उभे केले — हे स्वप्न पाहणे, हेच खरे धाडस.",
         "author": "Satish Magar", "sentiment": "Joyful/Cultural", "reference_book": "Magarpatta Story"},
    ]},

    {"name": "Kothrud — Nehru Memorial Hall", "latitude": 18.5074, "longitude": 73.8077, "trait": "Katta Culture",
     "quotes": [
        {"text": "कोथरुड म्हणजे पुण्यातील शांत माहेरघर — नव्या पिढीने जुन्या संस्कृतीचे पांघरूण घातलेले.",
         "author": "Suresh Bhat", "sentiment": "Nostalgic/Urban", "reference_book": "Suresh Bhat Samgra Kavita"},
        {"text": "भीमसेनजींचा आवाज कोथरुडच्या रात्री विरघळतो — जणू पहाड गातो.",
         "author": "Kumar Gandharva (Vibe)", "sentiment": "Artistic/Reflective", "reference_book": "Anhat Naad"},
    ]},

    {"name": "Viman Nagar", "latitude": 18.5679, "longitude": 73.9143, "trait": "Katta Culture",
     "quotes": [
        {"text": "विमान नगरात उतरलेल्या प्रत्येकाला वाटते — हे पुणे आहे की परदेश?",
         "author": "Narayan Surve", "sentiment": "Nostalgic/Urban", "reference_book": "Majhe Vidyapeeth"},
    ]},

    {"name": "Aundh — Peshwa Park", "latitude": 18.5590, "longitude": 73.8077, "trait": "Nature",
     "quotes": [
        {"text": "औंधचे झाडे उन्हाळ्यातही सावली देतात — माणसांनी झाडांकडून शिकावे असे मला वाटते.",
         "author": "V. P. Kale", "sentiment": "Nature/Poetic", "reference_book": "Swarajyachi Savli"},
    ]},

    {"name": "Deccan Gymkhana", "latitude": 18.5197, "longitude": 73.8385, "trait": "Katta Culture",
     "quotes": [
        {"text": "डेक्कन जिमखान्यावरील सकाळची फेरी म्हणजे पुण्याचे सामाजिक संसद — सगळे विचार इथेच होतात.",
         "author": "Pu La Deshpande", "sentiment": "Humorous", "reference_book": "Vyakti ani Valli"},
        {"text": "डेक्कनची रहदारी म्हणजे पुणेकरांचे संगीत — प्रत्येकाचा सूर वेगळा, पण राग एकच.",
         "author": "G. A. Kulkarni", "sentiment": "Artistic/Reflective", "reference_book": "Pinglavel"},
    ]},

    {"name": "Jangli Maharaj Road", "latitude": 18.5214, "longitude": 73.8415, "trait": "Katta Culture",
     "quotes": [
        {"text": "जंगली महाराज रस्त्यावरून चालताना मला कधी कधी वाटते — हे वाहन नाही चालत, माणसाचे दिवस चालतात.",
         "author": "Madhuri Purandhare", "sentiment": "Nostalgic/Urban", "reference_book": "Pune: Mazhe Shahar"},
    ]},

    {"name": "Law College Road", "latitude": 18.5232, "longitude": 73.8372, "trait": "Educational",
     "quotes": [
        {"text": "लॉ कॉलेज रोडवर युक्तिवाद शिकायला येतात, पण इथल्या चहाच्या टपरीवर खऱ्या गोष्टी कळतात.",
         "author": "Acharya Atre", "sentiment": "Humorous", "reference_book": "Navyug"},
    ]},

    {"name": "Sinhagad Road Foothills", "latitude": 18.4623, "longitude": 73.7944, "trait": "Nature",
     "quotes": [
        {"text": "सिंहगड जिंकणे सोपे नाही, पण सिंहगडाचा रस्ता — तोच एक जिद्दीची परंपरा शिकवतो.",
         "author": "Tamashir (Tanvir Khan)", "sentiment": "Historical/Serious", "reference_book": "Sinhagad Parva"},
        {"text": "गडावर पोहचलो, ताक प्यायलो — आणि ठरवले, पुढच्या वेळी रस्त्यातच थांबायचे.",
         "author": "Pu La Deshpande", "sentiment": "Humorous", "reference_book": "Apurvaai"},
    ]},

    {"name": "Fergusson College Campus", "latitude": 18.5214, "longitude": 73.8447, "trait": "Educational",
     "quotes": [
        {"text": "फर्ग्युसनच्या वर्गात बसताना कळते की ज्ञान हे आकाशासारखे असते — सीमा नाही.",
         "author": "Gopal Ganesh Agarkar", "sentiment": "Historical/Serious", "reference_book": "Sudharak Lekh"},
        {"text": "फर्ग्युसनची कँटीन म्हणजे विचारांची मशीन — वडापाव खाताना क्रांती घडते.",
         "author": "Sane Guruji (Vibe)", "sentiment": "Humorous", "reference_book": "Shyamchi Aai"},
    ]},

    {"name": "Wanowrie Chowk", "latitude": 18.4997, "longitude": 73.8937, "trait": "Katta Culture",
     "quotes": [
        {"text": "वानवडीच्या रस्त्यावर रात्री एकटे चालताना शहराचा श्वास ऐकू येतो.",
         "author": "Dilip Chitre", "sentiment": "Nostalgic/Urban", "reference_book": "Pune: Ek Shahar"},
    ]},

    {"name": "Katraj Snake Park", "latitude": 18.4520, "longitude": 73.8620, "trait": "Nature",
     "quotes": [
        {"text": "कात्रजच्या डोंगरात निसर्ग वसलेला आहे — माणसाने फक्त त्याला त्रास द्यायचा नाही.",
         "author": "V. P. Kale", "sentiment": "Nature/Poetic", "reference_book": "Ranangan"},
    ]},

    {"name": "Vishrantwadi — Airport Road", "latitude": 18.5772, "longitude": 73.9080, "trait": "Katta Culture",
     "quotes": [
        {"text": "विश्रांतवाडीत विश्रांती नाही — पण इथे येणाऱ्या प्रत्येकाला नवीन सुरुवातीची आस असते.",
         "author": "Narayan Surve", "sentiment": "Nostalgic/Urban", "reference_book": "Majhe Vidyapeeth"},
    ]},

    {"name": "Baner — Sus Road", "latitude": 18.5583, "longitude": 73.7779, "trait": "Nature",
     "quotes": [
        {"text": "बाणेरचे डोंगर सांगतात — शहर मोठे होते, पण माती आपलीच राहते.",
         "author": "Vinda Karandikar", "sentiment": "Nature/Poetic", "reference_book": "Dhrupad"},
    ]},

    # ══ 15 NEW LOCATIONS ═════════════════════════════════════════════════════

    # ── HISTORIC (4) ──────────────────────────────────────────────────────────

    {"name": "Vishrambaug Wada", "latitude": 18.5163, "longitude": 73.8538, "trait": "Historic",
     "quotes": [
        {"text": "विश्रामबागवाडा म्हणजे पेशवाईच्या वैभवाचा शेवटचा श्वास — या दगडांत इतिहास थांबला आहे.",
         "author": "G. H. Khare", "sentiment": "Historical/Serious", "reference_book": "Peshwe Darbar"},
        {"text": "वाड्याच्या दरवाजाशी उभे राहिलो आणि एक क्षण वाटले — आत बाजीराव अजून जगतो.",
         "author": "Ranjit Desai", "sentiment": "Nature/Poetic", "reference_book": "Swami"},
    ]},

    {"name": "Tambdi Jogeshwari Temple", "latitude": 18.5161, "longitude": 73.8558, "trait": "Historic",
     "quotes": [
        {"text": "ताम्हिणी घाटाच्या पायथ्याशी जोगेश्वरी — शहरात देवाची साडेतीन पीठे कशी उभी राहिली, हे पुण्याचंच रहस्य.",
         "author": "Devotional Tradition", "sentiment": "Spiritual/Grand", "reference_book": "Pune Kshetra Darshan"},
    ]},

    {"name": "Lal Mahal", "latitude": 18.5199, "longitude": 73.8561, "trait": "Historic",
     "quotes": [
        {"text": "लाल महालात शिवाजी महाराज लहानाचे मोठे झाले — इथली माती स्वराज्याची बीजे घेऊन आहे.",
         "author": "Babasaheb Purandare", "sentiment": "Historical/Serious", "reference_book": "Raja Shivchhatrapati"},
        {"text": "लाल महालाचा लाल रंग म्हणजे रक्त नाही, जिद्द आहे — एका मराठ्याची.",
         "author": "Vinda Karandikar", "sentiment": "Nature/Poetic", "reference_book": "Dhrupad"},
    ]},

    {"name": "Pataleshwar Cave Temple", "latitude": 18.5231, "longitude": 73.8439, "trait": "Historic",
     "quotes": [
        {"text": "पाताळेश्वराच्या गुहेत दगड कोरले गेले — आणि त्या कोरण्यात एक पिढीचे स्वप्न जगले.",
         "author": "Keshavsut", "sentiment": "Historical/Philosophical", "reference_book": "Manasi"},
    ]},

    # ── EDUCATIONAL (4) ───────────────────────────────────────────────────────

    {"name": "Savitribai Phule Pune University", "latitude": 18.5579, "longitude": 73.8073, "trait": "Educational",
     "quotes": [
        {"text": "ज्ञान हे एकट्याचे नसते, ते सर्वांचे आहे — हे विद्यापीठाने मला शिकवले.",
         "author": "Savitribai Phule", "sentiment": "Historical/Serious", "reference_book": "Kavya Phule"},
        {"text": "युनिव्हर्सिटीच्या झाडांखाली बसून परीक्षेचा अभ्यास झाला नाही, पण जगाचा झाला.",
         "author": "Pu La Deshpande", "sentiment": "Humorous", "reference_book": "Apurvaai"},
    ]},

    {"name": "College of Engineering Pune (COEP)", "latitude": 18.5308, "longitude": 73.8474, "trait": "Educational",
     "quotes": [
        {"text": "कोएपच्या भिंती बोलतात — इथे शतकापेक्षा जास्त काळ विचार घडले, आणि भविष्यही.",
         "author": "Narayan Surve", "sentiment": "Historical/Serious", "reference_book": "Majhe Vidyapeeth"},
    ]},

    {"name": "Symbiosis International University — Viman Nagar", "latitude": 18.5600, "longitude": 73.9143, "trait": "Educational",
     "quotes": [
        {"text": "वसुधैव कुटुम्बकम् — एका देशाचे विद्यार्थी नाहीत, जगाचे हेच खरे सिम्बायोसिस.",
         "author": "Dr. S. B. Mujumdar", "sentiment": "Joyful/Cultural", "reference_book": "Vasudhaiva Kutumbakam"},
    ]},

    {"name": "Gokhale Institute of Politics & Economics", "latitude": 18.5266, "longitude": 73.8461, "trait": "Educational",
     "quotes": [
        {"text": "अर्थशास्त्र हे फक्त पैशाचे नाही — माणसाच्या जगण्याचे गणित आहे.",
         "author": "Gopal Krishna Gokhale", "sentiment": "Historical/Philosophical", "reference_book": "Servant of India"},
    ]},

    # ── NATURE (4) ────────────────────────────────────────────────────────────

    {"name": "Pashan Lake", "latitude": 18.5474, "longitude": 73.8082, "trait": "Nature",
     "quotes": [
        {"text": "पाषाण तलावावर सकाळी उभे राहिलो — पाण्यात आकाश आणि मनात शांती, दोन्ही एकत्र.",
         "author": "B. S. Mardhekar", "sentiment": "Nature/Poetic", "reference_book": "Kahi Kavita"},
        {"text": "पाषाण तलावाच्या काठावर पक्षी बोलतात आणि माणूस ऐकतो — हे पुण्याचे सर्वात मोठे सांस्कृतिक केंद्र आहे.",
         "author": "Salim Ali (Vibe)", "sentiment": "Nature/Poetic", "reference_book": "The Book of Indian Birds"},
    ]},

    {"name": "Sinhagad Fort", "latitude": 18.3664, "longitude": 73.7553, "trait": "Nature",
     "quotes": [
        {"text": "गड आला पण सिंह गेला — तानाजींच्या बलिदानाने सिंहगड अमर झाला.",
         "author": "Babasaheb Purandare", "sentiment": "Historical/Serious", "reference_book": "Raja Shivchhatrapati"},
        {"text": "सिंहगडावरचे ताक आणि भाकरी — यापेक्षा मोठे जेवण जगात नाही, हे मला गडावर जाऊन कळले.",
         "author": "Pu La Deshpande", "sentiment": "Humorous", "reference_book": "Apurvaai"},
    ]},

    {"name": "Khadakwasla Dam", "latitude": 18.4370, "longitude": 73.7729, "trait": "Nature",
     "quotes": [
        {"text": "खडकवासल्याचे पाणी पाहताना जाणवते — निसर्ग माणसाला नेहमी माफ करतो, याचा आधार तोच.",
         "author": "V. P. Kale", "sentiment": "Nature/Poetic", "reference_book": "Ranangan"},
    ]},

    {"name": "Mulshi Lake", "latitude": 18.5110, "longitude": 73.5280, "trait": "Nature",
     "quotes": [
        {"text": "मुळशीच्या जलाशयात आकाश विरघळते — इथे शहराचा आवाज नाही, फक्त पाण्याचा श्वास.",
         "author": "Vinda Karandikar", "sentiment": "Nature/Poetic", "reference_book": "Dhrupad"},
    ]},

    # ── KATTA CULTURE (3) ─────────────────────────────────────────────────────

    {"name": "Vaishali Restaurant — FC Road", "latitude": 18.5258, "longitude": 73.8432, "trait": "Katta Culture",
     "quotes": [
        {"text": "वैशालीत बसून चहा पिणे म्हणजे पुणेकरांचा जन्मसिद्ध हक्क — बाकीच्यांनी रांगेत थांबावे.",
         "author": "Pu La Deshpande", "sentiment": "Humorous", "reference_book": "Vyakti ani Valli"},
        {"text": "वैशालीच्या डोशाचा सुगंध आणि मित्रांच्या गप्पा — हे पुण्याचे खरे तत्त्वज्ञान.",
         "author": "Puneri Culture", "sentiment": "Joyful/Cultural", "reference_book": "Purachi Puneri"},
    ]},

    {"name": "Marz-O-Rin Bakery — Camp", "latitude": 18.5163, "longitude": 73.8778, "trait": "Katta Culture",
     "quotes": [
        {"text": "कॅम्पातील बेकरी म्हणजे पुण्यात राहिलेल्या ब्रिटिश सुगंधाचा शेवटचा पुरावा.",
         "author": "Dilip Chitre", "sentiment": "Nostalgic/Urban", "reference_book": "Pune: Ek Shahar"},
    ]},

    {"name": "Tulsi Baug Market", "latitude": 18.5178, "longitude": 73.8566, "trait": "Katta Culture",
     "quotes": [
        {"text": "तुळशीबागेत घासाघीस केल्याशिवाय पुणेकर नाही — इथे खरेदी नाही, स्पर्धा असते.",
         "author": "Acharya Atre", "sentiment": "Humorous", "reference_book": "Navyug"},
        {"text": "तुळशीबागेच्या गर्दीत हरवलेलो मी — आणि सापडलो तिथेच, माझ्याच माणसांमध्ये.",
         "author": "G. A. Kulkarni", "sentiment": "Nostalgic/Urban", "reference_book": "Pinglavel"},
    ]},

]

# ─────────────────────────────────────────────────────────────────────────────

def seed_data():
    db = SessionLocal()
    total_quotes = sum(len(l["quotes"]) for l in locations_data)
    print(f"Seeding {len(locations_data)} locations, {total_quotes} quotes...\n")

    for loc_data in locations_data:
        db_loc = Location(
            name=loc_data["name"],
            latitude=loc_data["latitude"],
            longitude=loc_data["longitude"],
            trait=loc_data.get("trait"),
        )
        db.add(db_loc)
        db.commit()
        db.refresh(db_loc)

        for q_data in loc_data["quotes"]:
            db_quote = Quote(
                text=q_data["text"],
                author=q_data["author"],
                author_bio=AUTHOR_BIOS.get(q_data["author"]),  # None if not in dict
                sentiment=q_data["sentiment"],
                reference_book=q_data["reference_book"],
                location_id=db_loc.id,
            )
            db.add(db_quote)
            db.commit()
            db.refresh(db_quote)

            nlp_layer.add_quote_to_vector_db(
                quote_id=str(db_quote.id),
                text=q_data["text"],
                metadata={
                    "author":         q_data["author"],
                    "sentiment":      q_data["sentiment"],
                    "reference_book": q_data["reference_book"],
                    "location_name":  loc_data["name"],
                    "location_id":    db_loc.id,
                    "trait":          loc_data.get("trait", ""),
                },
            )

        n = len(loc_data["quotes"])
        print(f"  [OK] {loc_data['name']} ({n} quote{'s' if n > 1 else ''}) [{loc_data.get('trait')}]")

    db.close()
    print(f"\nSeeding complete! {len(locations_data)} locations, {total_quotes} quotes.")

if __name__ == "__main__":
    seed_data()
