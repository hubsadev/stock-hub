# Encaissement / Recouvrement - Encaissement client

## Périmètre

Enregistrer un règlement client, l'attacher aux factures concernées et gérer les corrections ou annulations dans un cadre tracé.

## Écran / action

### Action 1 - Enregistrer un encaissement

- Écran : Encaissement client / Formulaire d'encaissement
- Action : Enregistrer le règlement

### Action 2 - Corriger ou annuler un encaissement

- Écran : Fiche encaissement
- Action : Corriger ou annuler

## Input

### Action 1 - Enregistrer un encaissement

- Champ / donnée : client, facture(s) cible(s), montant, date de paiement, mode de paiement, référence bancaire, compte/caisse, pièce jointe
- Source : utilisateur comptable ou import bancaire
- Caractère obligatoire : client, montant, date, mode de paiement
- Remarque : la facture peut être optionnelle si le paiement est en avance

### Action 2 - Corriger ou annuler un encaissement

- Champ / donnée : encaissement cible, motif de correction, montant corrigé, pièce justificative
- Source : utilisateur comptable habilité
- Caractère obligatoire : encaissement cible, motif
- Remarque : une correction doit rester tracée et réversible selon droits

## Traitement système

### Action 1 - Enregistrer un encaissement

1. Vérifier les droits et le rôle comptable.
2. Vérifier la validité des champs obligatoires et la cohérence montant/devise.
3. Créer l'encaissement et générer une référence unique.
4. Lier l'encaissement aux factures sélectionnées si présentes.
5. Mettre à jour les soldes et l'historique de paiement.

### Action 2 - Corriger ou annuler un encaissement

1. Vérifier les droits et l'état de l'encaissement.
2. Empêcher la correction si l'encaissement est déjà clos et verrouillé.
3. Créer une trace de correction ou d'annulation.
4. Recalculer les soldes des factures impactées.
5. Mettre à jour l'historique et les statuts liés.

## Output

### Action 1 - Enregistrer un encaissement

- Résultat visible : encaissement créé avec référence
- Statut affiché : enregistré / partiellement affecté
- Trace créée : ligne d'historique paiement par facture
- Notification éventuelle : alerte interne si paiement en avance sans facture

### Action 2 - Corriger ou annuler un encaissement

- Résultat visible : encaissement corrigé ou annulé
- Statut affiché : corrigé / annulé
- Trace créée : historique de correction avec motif
- Notification éventuelle : signalement à la finance si impact majeur

## Règle métier

### Action 1 - Enregistrer un encaissement

- Tout encaissement doit être rattachable à une ou plusieurs factures.
- Un encaissement partiel est autorisé et doit ajuster le reste dû.

### Action 2 - Corriger ou annuler un encaissement

- Une correction doit conserver une trace et un motif.
- L'annulation d'un paiement doit rebasculer les factures en impayé.

## Exception

### Action 1 - Enregistrer un encaissement

- Cas : client inexistant ou inactif
  Effet attendu : blocage et message d'erreur
- Cas : montant négatif ou nul
  Effet attendu : rejet de la saisie
- Cas : facture déjà soldée
  Effet attendu : alerte et interdiction d'affectation

### Action 2 - Corriger ou annuler un encaissement

- Cas : encaissement déjà clos et verrouillé
  Effet attendu : action refusée, demande d'escalade
- Cas : correction entraînant un solde négatif
  Effet attendu : blocage et message de cohérence
## Liens documentaires

- Relation -> [README du module](./README.md) : porte d’entrée du module Encaissement / Recouvrement
- Relation -> [Matrice 13-encaissement-recouvrement.md](../../matrices/13-encaissement-recouvrement.md) : correspondance consolidée entre concept, user story, règle métier et flux
- Relation -> [use-cases.md](../../use-cases.md) : cas d’usage de référence du module appliqués à cette fiche
- Relation -> [user-stories.md](../../user-stories.md) : attentes exprimées côté utilisateur appliqués à cette fiche
- Relation -> [functionnal-requirements.md](../../functionnal-requirements.md) : exigences fonctionnelles à décliner appliqués à cette fiche
- Relation -> [business-rules.md](../../business-rules.md) : règles métier structurantes appliqués à cette fiche
- Relation -> [permissions.md](../../permissions.md) : habilitations et rôles associés appliqués à cette fiche
- Relation -> [state-transitions.md](../../state-transitions.md) : transitions d’état concernées appliqués à cette fiche
- Relation -> [edge-cases.md](../../edge-cases.md) : cas limites à rejouer en recette appliqués à cette fiche
- Relation -> [user-flows.md](../../user-flows.md) : parcours opérationnels de référence appliqués à cette fiche

## Liens inter-modules

- Relation -> [03-consultation-correction-facture.md](../../12-facturation/03-consultation-correction-facture.md) : la facture source doit exister et rester corrélée au règlement saisi
- Relation -> [02-decisions-tracabilite.md](../../16-gouvernance-validation-controle-interne/02-decisions-tracabilite.md) : les corrections et arbitrages de recouvrement doivent être historisés
- Relation -> [01-vue-360-projet.md](../../18-vue-transverse-affaire-projet/01-vue-360-projet.md) : le statut d’encaissement doit rester visible dans la vue projet consolidée

