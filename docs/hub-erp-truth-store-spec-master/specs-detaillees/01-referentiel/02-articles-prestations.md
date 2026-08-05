# Referentiel - Articles et prestations

## Perimetre

Creation et parametrage des articles ou prestations utilisables dans achats, offres et stock.

## Ecran / action

### Action 1 - Creer un article ou une prestation

- Ecran : Referentiel > Articles/Prestations > Creer
- Action : Enregistrer la fiche

### Action 2 - Definir les caracteristiques d un article

- Ecran : Referentiel > Articles/Prestations > Fiche
- Action : Enregistrer les caracteristiques

## Input

### Action 1 - Creer un article ou une prestation

- Champ / donnee : libelle, categorie, type (materiel ou prestation), unite, TVA
- Source : saisie utilisateur
- Caractere obligatoire : oui pour libelle, categorie, type
- Remarque : certains champs sont conditionnels selon le type

### Action 2 - Definir les caracteristiques d un article

- Champ / donnee : caracteristiques techniques, variante, lot ou numero de serie si requis
- Source : saisie utilisateur
- Caractere obligatoire : selon la politique de qualite et de tracabilite
- Remarque : impact sur la gestion des variantes et la traçabilite

## Traitement systeme

### Action 1 - Creer un article ou une prestation

1. Verifier les droits de creation.
2. Verifier les champs obligatoires.
3. Generer une reference unique.
4. Creer la fiche article/prestation.
5. Rendre l article utilisable dans achats, offres et stock.

### Action 2 - Definir les caracteristiques d un article

1. Verifier les droits de modification.
2. Verifier la validite des caracteristiques.
3. Enregistrer les caracteristiques.
4. Historiser la modification.

## Output

### Action 1 - Creer un article ou une prestation

- Resultat visible : fiche article/prestation creee
- Statut affiche : Actif
- Trace creee : historique de creation
- Notification eventuelle : none par defaut

### Action 2 - Definir les caracteristiques d un article

- Resultat visible : caracteristiques visibles sur la fiche
- Statut affiche : inchangé
- Trace creee : historique de modification
- Notification eventuelle : none

## Regle metier

### Action 1 - Creer un article ou une prestation

- Un article doit appartenir a une categorie metier definie.
- Un article peut etre de type materiel ou prestation.

### Action 2 - Definir les caracteristiques d un article

- Les caracteristiques doivent permettre de differencier des variantes metier distinctes.
- Certains articles exigent une tracabilite par lot ou numero de serie.

## Exception

### Action 1 - Creer un article ou une prestation

- Cas : categorie inexistante ; Effet attendu : blocage avec message.
- Cas : type non valide ; Effet attendu : erreur de validation.

### Action 2 - Definir les caracteristiques d un article

- Cas : modification d un article deja utilise ; Effet attendu : autorisee mais historisee.

## Liens documentaires

- Relation -> [matrices/01-referentiel.md](../../matrices/01-referentiel.md) : cadrage des articles, prestations et objets logistiques du référentiel.
- Relation -> [functionnal-requirements.md](../../functionnal-requirements.md) : exigences de création, consultation et gestion des caractéristiques.
- Relation -> [business-rules.md](../../business-rules.md) : règles de normalisation, de type matériel ou prestation et de traçabilité.
- Relation -> [permissions.md](../../permissions.md) : droits d'administration des articles et prestations.
- Relation -> [edge-cases.md](../../edge-cases.md) : variantes, doublons et modifications sur objets déjà utilisés.

## Liens inter-modules

- Relation -> [../02-avant-vente/02-etude-et-chiffrage.md](../02-avant-vente/02-etude-et-chiffrage.md) : le catalogue article/prestation alimente le chiffrage des offres.
- Relation -> [../05-achats/01-expression-de-besoin.md](../05-achats/01-expression-de-besoin.md) : les articles et prestations sont saisis dans les besoins et demandes d'achat.
- Relation -> [../06-stock-logistique-magasin/01-reception-fournisseur.md](../06-stock-logistique-magasin/01-reception-fournisseur.md) : les articles matériels structurent les réceptions et quantités reçues.
