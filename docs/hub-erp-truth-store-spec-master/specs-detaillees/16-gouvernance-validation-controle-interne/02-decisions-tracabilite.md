# Gouvernance / Validation / Contrôle interne - Décisions et traçabilité

## Périmètre

Décision d'approbation ou de rejet et traçabilité des validations.

## Écran / action

### Action 1 - Approuver ou rejeter un objet

- Écran : Boîte de validation
- Action : Approuver / Rejeter

### Action 2 - Consulter l'historique des validations

- Écran : Historique de validation
- Action : Ouvrir l'historique

## Input

### Action 1 - Approuver ou rejeter un objet

- Champ / donnée : Décision ; Source : valideur habilité ; Caractère obligatoire : oui ; Remarque : approuvé ou rejeté.
- Champ / donnée : Commentaire ; Source : valideur habilité ; Caractère obligatoire : non ; Remarque : obligatoire si rejet selon règle locale.

### Action 2 - Consulter l'historique des validations

- Champ / donnée : Périmètre (objet, période) ; Source : utilisateur habilité ; Caractère obligatoire : non ; Remarque : filtre d'affichage.

## Traitement système

### Action 1 - Approuver ou rejeter un objet

1. Vérifier les droits du valideur et son niveau attendu.
2. Vérifier l'état de l'objet et l'étape courante.
3. Enregistrer la décision, l'auteur et l'horodatage.
4. Mettre à jour le statut de l'objet selon le circuit.
5. Notifier le propriétaire de l'objet et les autres valideurs concernés.

### Action 2 - Consulter l'historique des validations

1. Vérifier les droits de consultation.
2. Charger la liste des décisions par étape.
3. Afficher l'identité du valideur, la date et le commentaire.
4. Permettre la traçabilité complète par objet.

## Output

### Action 1 - Approuver ou rejeter un objet

- Résultat visible : Décision enregistrée.
- Statut affiché : En validation / Validé / Rejeté.
- Trace créée : Journal de validation.
- Notification éventuelle : Propriétaire et acteurs concernés.

### Action 2 - Consulter l'historique des validations

- Résultat visible : Historique complet affiché.
- Statut affiché : États successifs visibles.
- Trace créée : Aucune nouvelle trace, consultation seulement.
- Notification éventuelle : Aucune.

## Règle métier

### Action 1 - Approuver ou rejeter un objet

- Règle 1 : Toute décision de validation ou rejet doit être tracée.
- Règle 2 : Une validation rejetée peut être resoumise après correction.

### Action 2 - Consulter l'historique des validations

- Règle 1 : L'historique doit être consultable par les rôles autorisés.
- Règle 2 : Les décisions sont immuables.

## Exception

### Action 1 - Approuver ou rejeter un objet

- Cas : Valideur non attendu ; Effet attendu : décision refusée.
- Cas : Objet déjà clôturé ; Effet attendu : action bloquée.

### Action 2 - Consulter l'historique des validations

- Cas : Droits insuffisants ; Effet attendu : accès refusé.
- Cas : Historique absent ; Effet attendu : message "aucune décision".
## Liens documentaires

- Relation -> [README du module](./README.md) : porte d’entrée du module Gouvernance / Validation / Contrôle interne
- Relation -> [Matrice 16-gouvernance-validation-controle-interne.md](../../matrices/16-gouvernance-validation-controle-interne.md) : correspondance consolidée entre concept, user story, règle métier et flux
- Relation -> [use-cases.md](../../use-cases.md) : cas d’usage de référence du module appliqués à cette fiche
- Relation -> [user-stories.md](../../user-stories.md) : attentes exprimées côté utilisateur appliqués à cette fiche
- Relation -> [functionnal-requirements.md](../../functionnal-requirements.md) : exigences fonctionnelles à décliner appliqués à cette fiche
- Relation -> [business-rules.md](../../business-rules.md) : règles métier structurantes appliqués à cette fiche
- Relation -> [permissions.md](../../permissions.md) : habilitations et rôles associés appliqués à cette fiche
- Relation -> [state-transitions.md](../../state-transitions.md) : transitions d’état concernées appliqués à cette fiche
- Relation -> [edge-cases.md](../../edge-cases.md) : cas limites à rejouer en recette appliqués à cette fiche
- Relation -> [user-flows.md](../../user-flows.md) : parcours opérationnels de référence appliqués à cette fiche

## Liens inter-modules

- Relation -> [03-consultation-correction-facture.md](../../12-facturation/03-consultation-correction-facture.md) : les corrections de facture doivent garder la trace de la décision
- Relation -> [02-echeances-relances.md](../../13-encaissement-recouvrement/02-echeances-relances.md) : les relances et remises doivent être historisées pour le recouvrement
- Relation -> [03-risques-cockpit-projet.md](../../18-vue-transverse-affaire-projet/03-risques-cockpit-projet.md) : les décisions sensibles doivent remonter comme risques ou points d’attention projet

