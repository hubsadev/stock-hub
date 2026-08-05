Parfait. Voici le **3-f) Edge cases**, toujours **module par module**, en restant strictement sur les **cas limites, cas exceptionnels et cas de bord métier** à prévoir dans l’ERP. Je ne passe pas encore aux **user flows**. 

# 3-f) Edge cases

## Module 1 — Référentiel

1. Création d’un client avec un nom très proche d’un client déjà existant.
2. Création d’un fournisseur en doublon avec une autre orthographe.
3. Désactivation d’un article encore utilisé dans un devis, une commande ou un stock actif.
4. Désactivation d’un site déjà lié à des OT, tickets ou PV.
5. Modification des caractéristiques d’un article déjà utilisé dans des transactions historiques.
6. Fusion ou regroupement de deux fiches référentielles créées en doublon.
7. Article utilisé à la fois comme matériel dans un contexte et comme prestation dans un autre.
8. Site rattaché à plusieurs affaires successives ou simultanées.
9. Équipement déplacé d’un site à un autre sans perte d’historique.
10. Dépôt temporaire créé pour chantier puis fermé après fin de projet.  

## Module 2 — Avant-vente

1. Offre avec marge en dessous du seuil d’alerte configuré.
2. Offre validée techniquement mais pas encore validée par la direction.
3. Offre rejetée puis corrigée et resoumise.
4. Plusieurs versions d’offre, devis ou factures proforma envoyées au client, avec besoin d’identifier la version officiellement active.
5. Offre expirée parce que la date limite client est dépassée avant décision.
6. Demande de cotation retenue partiellement seulement, avec périmètre retenu différent de l’offre initiale.
7. Appel d’offres annulé par le client après lancement de l’étude.
8. Étude technique incomplète mais offre créée quand même.
9. Client demandant une révision de prix après validation interne.
10. Plusieurs lots dont certains sont retenus et d’autres abandonnés. 

## Module 3 — Contrats / Affaires / Projets

1. Contrat signé pour un périmètre différent de l’offre retenue.
2. Projet créé alors que certaines données contractuelles ne sont pas encore finalisées.
3. Un seul projet avec plusieurs zones, chantiers et sites.
4. Scission d’un projet en plusieurs sous-projets après démarrage.
5. Fusion de deux périmètres projet dans une seule affaire de rattachement.
6. Projet suspendu temporairement pour cause client, autorisation ou accès site.
7. Projet clôturé opérationnellement mais maintenance encore active.
8. Maintenance démarrant avant la fin complète du déploiement.
9. Changement de chef de projet en cours de projet.
10. Annulation d’un projet après engagement partiel de coûts. 

## Module 4 — Budget / Pilotage financier projet

1. Budget créé avec certains postes à zéro puis complété plus tard.
2. Budget validé puis nécessité de révision après hausse des coûts fournisseurs.
3. Budget révisé plusieurs fois sur une même affaire.
4. Dépense urgente demandée alors que le budget n’est pas encore validé.
5. Dépense engagée sur un poste budgétaire déjà dépassé.
6. Nouvelle catégorie de dépense apparue en cours de projet mais absente du budget initial.
7. Réaffectation de budget d’un poste à un autre.
8. Comparaison entre budget initial, budget révisé et coût réel donnant des écarts contradictoires selon la période.
9. Marge cible atteignable au départ mais dégradée après incidents d’exécution.
10. Projet à faible valeur mais très forte consommation logistique non anticipée. 

## Module 5 — Achats

1. Expression de besoin créée alors que l’article existe déjà en stock disponible.
2. Demande d’achat portant sur un mélange d’articles et de prestations.
3. Même besoin découpé entre plusieurs fournisseurs pour atteindre la quantité requise.
4. Deux fournisseurs retenus pour le même article avec livraisons à dates différentes.
5. Fournisseur choisi incapable de livrer la totalité après émission de commande.
6. Demande d’achat validée puis annulée avant commande.
7. Demande d’achat partiellement commandée pendant une longue période.
8. Comparatif d’offres incomplet car certains fournisseurs n’ont répondu que sur une partie des lignes.
9. Variation forte de prix entre la validation de la DA et l’émission de la commande.
10. Achat urgent hors processus standard mais devant rester traçable.
11. Prestation achetée sans mouvement de stock.
12. Commande émise avec substitution d’un article par un équivalent fournisseur. 

## Module 6 — Stock / Logistique / Magasin

1. Réception partielle d’une commande avec reliquat restant ouvert.
2. Réception d’une quantité différente de la quantité commandée.
3. Réception de matériel endommagé ou non conforme.
4. Réception correcte mais sans numéro de série alors qu’il est requis.
5. Stock réservé à une affaire mais réaffecté en urgence à une autre.
6. Sortie de stock demandée alors que la quantité disponible est insuffisante.
7. Retour d’un matériel depuis chantier dans un état dégradé.
8. Transfert de matériel entre chantiers sans passage par l’entrepôt principal.
9. Matériel affecté à un technicien puis perdu, cassé ou non restitué.
10. Inventaire physique révélant un écart négatif ou positif important.
11. Même article présent dans plusieurs emplacements avec divergences de comptage.
12. Réintégration d’un matériel qui avait déjà été considéré comme consommé.
13. Consommable non sérialisé mélangé à du matériel sérialisé dans la même opération.
14. Stock véhicule utilisé en urgence sans bon préalable puis régularisé après coup. 

## Module 7 — Exécution terrain / Ordres de travail

1. OT planifié mais équipe ou prestataire indisponible le jour prévu.
2. OT affecté à un site erroné puis corrigé après démarrage.
3. Intervention commencée sans connectivité réseau sur mobile/tablette.
4. Temps passé saisi après la fin réelle de l’intervention.
5. Matériel consommé non prévu initialement dans l’OT.
6. Checklist obligatoire incomplète au moment de clôturer.
7. Anomalie détectée mais non résolue sur place.
8. Intervention suspendue à cause d’absence d’accès site ou absence du client.
9. Intervention terminée techniquement mais PV non encore signé.
10. Deux équipes ou prestataires intervenant successivement sur le même OT.
11. OT créé depuis ticket mais finalement traité à distance sans déplacement.
12. Intervention annulée après préparation logistique déjà engagée.
13. Photos ou pièces jointes manquantes alors qu’elles sont requises.
14. Changement d’équipe en cours d’intervention. 

## Module 8 — PV / Preuves de réalisation

1. PV signé avec réserves.
2. PV non signé parce que le représentant client est absent.
3. Signature refusée par le client malgré intervention réalisée.
4. PV généré avec données incomplètes.
5. Plusieurs PV pour un même site ou une même intervention.
6. PV partiel pour une réalisation incomplète.
7. Réserve mineure n’empêchant pas la mise en service.
8. Réserve majeure bloquant la facturation ou la clôture.
9. Photos jointes au PV mais tests non renseignés.
10. PV signé hors ligne puis synchronisé plus tard.
11. Correction demandée sur un PV déjà signé.
12. Perte de la preuve de signature ou signature illisible. 

## Module 9 — Temps / Ressources / Pointage

1. Pointage soumis sans affectation à une affaire, tâche, OT ou chantier.
2. Pointage d’un employé réparti sur plusieurs affaires dans la même journée.
3. Heures supplémentaires déclarées mais non validées par le responsable.
4. Oubli de pointage régularisé plusieurs jours plus tard.
5. Pointage validé puis corrigé après découverte d’erreur.
6. Engin utilisé sans avoir été préalablement affecté au chantier.
7. Véhicule partagé par plusieurs équipes la même journée.
8. Ressource humaine présente mais affectation métier incorrecte.
9. Pointage d’une équipe avec un membre absent remplacé au dernier moment.
10. Pointage saisi pour une date déjà clôturée.
11. Chevauchement horaire entre deux interventions pour le même technicien.
12. Temps terrain saisi dans OT et aussi dans feuille de temps, avec risque de double comptage. 

## Module 10 — Coûts analytiques / Rentabilité

1. Coût réel incomplet car certaines consommations n’ont pas encore été imputées.
2. Intervention clôturée mais coût encore provisoire.
3. Coût d’un même matériel potentiellement compté deux fois via stock et achat direct.
4. Sous-traitance engagée mais facture fournisseur pas encore reçue.
5. Déplacement mutualisé entre plusieurs sites ou OT.
6. Coût d’un véhicule réparti entre plusieurs équipes sur la même journée.
7. Coûts réels supérieurs au budget alors que l’avancement est faible.
8. Marge positive au niveau affaire mais négative sur certains sites.
9. Rentabilité erronée si le pointage ou les consommations sont incomplètes.
10. Recalcul analytique après correction tardive d’un pointage ou mouvement de stock. 

## Module 11 — BTP / Avancement / Attachements / Situations

1. Quantités saisies puis contestées par le client.
2. Même quantité déclarée deux fois sur deux périodes différentes.
3. Attachement validé en interne mais non encore validé côté client.
4. Situation mensuelle générée alors que certaines quantités restent en litige.
5. Avancement physique supérieur à l’avancement financier.
6. Retenue de garantie, acomptes et pénalités appliqués simultanément.
7. Correction d’une quantité déjà valorisée dans une situation précédente.
8. Chantier avec avancement réel mais sans attachement complet à temps.
9. Ouvrage partiellement exécuté mais non entièrement mesurable à la date de clôture mensuelle.
10. Plusieurs attachements sur une même période pour le même chantier.
11. Situation rejetée puis recalculée.
12. Projet stoppé alors qu’une situation partielle doit quand même être émise. 

## Module 12 — Facturation

1. Facture basée sur PV avec réserves.
2. Facture partielle sur une affaire non encore totalement exécutée.
3. Facture émise puis contestée par le client.
4. Facture créée à partir d’une situation ensuite corrigée.
5. Facturation multi-mode sur un même projet : au forfait, par site, par intervention et par maintenance.
6. Élément facturable déjà partiellement facturé auparavant.
7. Intervention réalisée mais non facturable car incluse dans la maintenance.
8. Fourniture matériel facturable avant la fin complète de l’installation.
9. Annulation d’une facture après envoi au client.
10. Erreur de rattachement d’une facture à la mauvaise affaire ou au mauvais site.
11. Plusieurs justificatifs pour une même facture.
12. Devise, taxes ou retenues spécifiques venant modifier le montant final.  

## Module 13 — Encaissement / Recouvrement

1. Paiement partiel d’une facture.
2. Paiement global couvrant plusieurs factures.
3. Paiement reçu sans référence claire de facture.
4. Écart entre montant payé et montant facturé.
5. Facture échue mais en litige, donc non relançable de manière standard.
6. Relances multiples sans réponse du client.
7. Encaissement enregistré puis annulé ou corrigé.
8. Règlement affecté à la mauvaise facture.
9. Acompte reçu avant émission de la facture finale.
10. Solde résiduel très faible dû à un arrondi ou à une retenue.
11. Paiement reçu après clôture supposée du dossier.
12. Client avec plusieurs affaires et un paiement non ventilé entre elles. 

## Module 14 — SAV / Maintenance / Ticketing

1. Ticket créé pour un site qui n’existe pas encore correctement dans le référentiel.
2. Ticket dupliqué pour le même incident.
3. Ticket hors périmètre contractuel mais nécessitant quand même une intervention payante.
4. Incident résolu à distance sans déplacement terrain.
5. Incident récurrent sur le même site peu après clôture d’un précédent ticket.
6. Priorité haute sans technicien immédiatement disponible.
7. SLA suspendu à cause d’attente client ou impossibilité d’accès.
8. Pièce à remplacer indisponible en stock.
9. Site encore sous garantie partielle mais pas sur tous les équipements.
10. Ticket clôturé techniquement mais facturation SAV non encore tranchée.
11. Plusieurs causes probables avant identification de la cause racine.
12. Intervention faite, service rétabli, puis incident réapparaît le même jour.
13. Ticket ouvert alors que contrat de maintenance expiré. 

## Module 15 — Planning / Coordination opérationnelle

1. Activité planifiée avant la réception du matériel nécessaire.
2. Deux activités concurrentes nécessitant la même équipe ou le même véhicule.
3. Replanification à répétition sur une même tâche.
4. Jalon atteint administrativement mais pas réellement sur le terrain.
5. Intervention urgente venant perturber le planning projet initial.
6. Dépendance entre génie civil, tirage fibre et installation équipements rompue par un retard amont.
7. Planning modifié après départ déjà programmé des équipes.
8. Site inaccessible le jour prévu.
9. Activité terminée partiellement seulement mais planning la considère comme achevée.
10. Activité reportée au mois suivant avec impact sur budget, OT et facturation. 

## Module 16 — Gouvernance / Validation / Contrôle interne

1. Objet soumis à validation mais un valideur est absent ou indisponible.
2. Rejet avec commentaire obligatoire ou sans commentaire.
3. Validation partielle obtenue alors qu’une autre validation manque encore.
4. Tentative d’action sur un objet non encore validé.
5. Réouverture d’un objet déjà validé pour correction.
6. Changement de circuit de validation en cours de traitement.
7. Dépassement de seuil imposant un niveau de validation supplémentaire.
8. Objet approuvé puis finalement annulé.
9. Conflit d’intérêt si le même utilisateur crée et valide le même objet.
10. Validation tardive après expiration du besoin ou changement de contexte.  

## Module 17 — Reporting / KPI / Direction

1. KPI calculé avec données incomplètes car période non clôturée.
2. Indicateur différent selon date de rafraîchissement.
3. Marge incohérente à cause de coûts non encore consolidés.
4. Avancement physique à jour mais encaissement en retard.
5. KPI tickets ou SLA faussé par tickets suspendus ou doublons.
6. Comparaison budget / réel biaisée par une révision budgétaire tardive.
7. Carnet de commandes gonflé par offres retenues mais non encore contractualisées.
8. Tableau de bord global correct mais détail affaire incomplet.
9. Données multi-sites ou multi-chantiers agrégées de façon trompeuse si le filtre n’est pas bien géré.
10. Rentabilité client positive au global mais négative sur une affaire spécifique. 

## Module 18 — Vue transverse Affaire / Projet

1. Projet avec certains modules actifs et d’autres non encore démarrés.
2. Projet clôturé mais avec ticket SAV encore ouvert.
3. Projet avec coûts engagés mais aucune facture émise.
4. Projet avec factures émises mais preuves d’exécution incomplètes sur certains volets.
5. Projet avec plusieurs sites, plusieurs chantiers et plusieurs modes de facturation.
6. Risques saisis dans la fiche projet sans action corrective encore décidée.
7. Blocage logistique impactant planning, coût et avancement simultanément.
8. Vue 360 affichant des données contradictoires car modules non encore synchronisés.
9. Projet techniquement terminé mais administrativement non clôturé.
10. Projet annulé avec historique partiel d’achats, stock, OT et facturation à conserver.  

La suite logique est maintenant **les user flows**, toujours **module par module** ou, si tu préfères plus utile, **par grands processus métier de bout en bout**.
