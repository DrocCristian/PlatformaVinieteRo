# Exportul datelor personale

Descărcarea directă păstrează obiectul JSON complet, toate cele 14 colecții, documentele imbricate și înregistrările arhivate. Clientul Supabase autentificat și politicile RLS rămân sursa autorizării; nu se folosește cheia administrativă.

Pentru a evita acumularea nelimitată a ciornelor în memoria serverului, exportul citește secvențial pagini de cel mult 25 de rânduri. Are un buget comun de 4 MiB de JSON UTF-8, maximum 10.000 de rânduri și un termen de 15 secunde pentru citirile de date. Bugetul include metadatele, delimitatorii și obiectele imbricate. La limita de rânduri se verifică existența unui rând suplimentar; limita exactă poate fi exportată complet.

Depășirea volumului întoarce 413 și îndrumă către /cont/suport pentru copia completă. Erorile bazei de date, expirarea termenului și întreruperea cererii întorc 503. Nu se trimite un fișier parțial și nu se afișează detalii tehnice private. Operatorul trebuie să soluționeze separat solicitările de copii complete prea mari pentru descărcarea directă; nu există încă generator asincron de arhive.

Limitele sunt per cerere, nu înlocuiesc protecțiile globale de trafic ale găzduirii sau politici viitoare de retenție. Citirile nu reprezintă un snapshot tranzacțional: modificările concurente ale contului pot necesita reluarea exportului, ca în versiunea anterioară.

Validarea include reproducerea inițială a exportului supradimensionat, testele pentru paginare completă, limite comune, caractere multibyte, anulare și erori. Nu se execută teste de încărcare pe conturi reale.
