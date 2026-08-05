# Avant-vente - Etude et chiffrage

## Perimetre

Saisie des metrees, besoins et contraintes, construction de l offre et chiffrage.

## Ecran / action

### Action 1 - Saisir une etude technique

- Ecran : Demande de cotation > Etude technique
- Action : Enregistrer l etude

### Action 2 - Construire une offre multi-lots

- Ecran : Offre > Structure des lots
- Action : Enregistrer l offre

### Action 3 - Calculer marge et cout estime

- Ecran : Offre > Synthese
- Action : Enregistrer pour recalcul

## Input

### Action 1 - Saisir une etude technique

- Champ / donnee : metrees, quantitatifs, besoins materiels, besoins main d oeuvre, duree
- Source : saisie utilisateur
- Caractere obligatoire : oui pour metrees et besoins
- Remarque : contraintes terrain a saisir si applicables

### Action 2 - Construire une offre multi-lots

- Champ / donnee : lots, articles/prestations, quantites, hypothese prix
- Source : saisie utilisateur
- Caractere obligatoire : oui pour chaque lot
- Remarque : type d offre a choisir

### Action 3 - Calculer marge et cout estime

- Champ / donnee : montant de vente, cout estime
- Source : saisie utilisateur ou calcul derive des lots
- Caractere obligatoire : oui
- Remarque : seuil de marge configurable

## Traitement systeme

### Action 1 - Saisir une etude technique

1. Verifier les droits du bureau d etudes.
2. Verifier la presence des champs requis.
3. Enregistrer l etude et lier a la demande.

### Action 2 - Construire une offre multi-lots

1. Verifier les droits.
2. Verifier la coherence des lots et articles.
3. Enregistrer l offre et versionner si besoin.
4. Marquer l offre comme En etude.

### Action 3 - Calculer marge et cout estime

1. Recalculer cout estime et marge brute.
2. Appliquer le seuil de marge.
3. Generer une alerte si sous seuil.
4. Historiser la version de calcul.

## Output

### Action 1 - Saisir une etude technique

- Resultat visible : etude technique enregistree
- Statut affiche : En etude si applicable
- Trace creee : historique etude
- Notification eventuelle : none

### Action 2 - Construire une offre multi-lots

- Resultat visible : offre et lots visibles
- Statut affiche : En etude
- Trace creee : version offre
- Notification eventuelle : none

### Action 3 - Calculer marge et cout estime

- Resultat visible : marge et cout affiches
- Statut affiche : inchangé
- Trace creee : historique de recalcul
- Notification eventuelle : alerte marge sous seuil

## Regle metier

### Action 2 - Construire une offre multi-lots

- Une offre peut avoir plusieurs versions, une seule est active.
- Une offre doit etre qualifiee comme devis ou facture proforma.

### Action 3 - Calculer marge et cout estime

- Le taux de marge est calcule sur montant de vente et cout estime.
- Alerte sous seuil sans blocage automatique.

## Exception

### Action 1 - Saisir une etude technique

- Cas : etude incomplete ; Effet attendu : sauvegarde partielle avec statut Brouillon.

### Action 2 - Construire une offre multi-lots

- Cas : lot sans lignes ; Effet attendu : blocage de validation.

### Action 3 - Calculer marge et cout estime

- Cas : montant de vente nul ; Effet attendu : blocage ou alerte.

## Liens documentaires

- Relation -> [matrices/02-avant-vente.md](../../matrices/02-avant-vente.md) : synthèse du chiffrage, des hypothèses et des validations.
- Relation -> [functionnal-requirements.md](../../functionnal-requirements.md) : exigences de calcul, de versioning et de validation du chiffrage.
- Relation -> [business-rules.md](../../business-rules.md) : règles de marge, de lotissement et de validation commerciale.
- Relation -> [state-transitions.md](../../state-transitions.md) : passage du brouillon vers la validation et les versions successives.
- Relation -> [edge-cases.md](../../edge-cases.md) : montant nul, lot incomplètement chiffré, hypothèses contradictoires.

## Liens inter-modules

- Relation -> [../01-referentiel/02-articles-prestations.md](../01-referentiel/02-articles-prestations.md) : le chiffrage repose sur le catalogue article/prestation.
- Relation -> [../04-budget-pilotage-financier-projet/01-budget-initial.md](../04-budget-pilotage-financier-projet/01-budget-initial.md) : le chiffrage commercial prépare le budget initial du projet.
- Relation -> [../04-budget-pilotage-financier-projet/03-suivi-ecarts-marge.md](../04-budget-pilotage-financier-projet/03-suivi-ecarts-marge.md) : la marge estimée du chiffrage se compare ensuite au suivi budgétaire.
