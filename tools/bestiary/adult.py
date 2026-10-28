# Grit 18+: bonus pun monsters for adult tables. Crude and punny, never cruel: no slurs.
# In the app they join the monster suggestions and New encounter only while the CM's Grit 18+ loot toggle is on.
THEME = "Grit 18+"
INTRO = ("Bonus monsters for **adult tables only**: crude, punny, and extra silly. Use them only when everyone at the table "
         "has said yes, and keep the X-card handy (Safety Tools, Chapter 8). They pair with Street Grit, but they'll crash "
         "any theme that lets them in. Crude and punny, never cruel. In the app they show up only while the Core Master's "
         "Grit 18+ loot toggle is on.")
M = [
 # ---- minions
 dict(n="Wiener Dogs", kind="minion", rar=1, lv=1, order=["spd","str"], atk=("Ankle bite","Yap"),
      d="A pack of dachshunds in one trench coat. Nobody wants to be surrounded by wieners, and yet here you are.",
      t="Swarm the shortest hero first. A tossed sausage scatters the whole pack for a round."),
 dict(n="Cock Roaches", kind="minion", rar=1, lv=2, order=["con","spd"], atk=("Peck","Crow at 3 a.m."),
      d="Half rooster, half roach. They'll survive the apocalypse, and they'll crow about it at 3 a.m.",
      t="When the last one drops, one more crawls out of the drain. There is always one more."),
 dict(n="Nut Crackers", kind="minion", rar=1, lv=2, order=["str","con"], atk=("Low blow","Walnut sling"),
      d="Wooden soldiers with big square jaws and one job. They aim low. They always aim low.",
      t="Go for whoever has the least armor below the belt. Any armor at all makes them visibly sad."),
 # ---- standard
 dict(n="Becky the Throat Goat", kind="standard", rar=1, lv=3, order=["con","str","lck"], atk=("Headbutt","Spat-out can"),
      d="A goat with no gag reflex and no shame. She eats tin cans, swords, wedding rings, and your dignity, in that order.",
      ab=[("Deep Swallow","con","dmg",["Stunned"],"She swallows the target's weapon, too. It comes back when Becky drops, slightly damp.")],
      t="Goes straight for whoever holds the shiniest weapon. Feed her something better and she's anyone's goat."),
 dict(n="Dick-clops", kind="standard", rar=2, lv=5, order=["str","con","cha"], atk=("Club (yes, that one)","Thrown boulder"),
      d="One giant eye, in entirely the wrong place. He's also cockeyed: he never hits who he's looking at, and nobody can look him in the eye.",
      ab=[("Cockeyed Swing","str","dmg",["Prone","Frightened"],"Hits the hero next to the one he's aiming at. The Core Master announces the aim first, for maximum confusion.")],
      t="Swings at whoever he thinks is staring, and always hits the hero beside them. Pants make him furious; none of them fit."),
 dict(n="Trojan Horse (Ribbed)", kind="standard", rar=2, lv=5, order=["con","str","spd"], atk=("Hoof","Spring-loaded soldier"),
      d="A big wooden horse, ribbed, full of tiny soldiers. Protection not guaranteed.",
      ab=[("Surprise Inside","con","util",[],"Pops out T Bandits (tiny soldiers) right next to it.")],
      t="Rolls up looking like a gift. Anyone who checks inside first gets the jump on the soldiers. Burns like, well, a wooden horse."),
 dict(n="Master Baiter", kind="standard", rar=1, lv=4, order=["int","spd","cha"], atk=("Gaff hook","Lure cast"),
      d="A fisherman with a tackle box of suspicious lures and a hat full of hooks. Spends way too much time alone with his rod.",
      ab=[("Reel 'Em In","int","dmg",["Prone"],"Drags the target T steps toward him.")],
      t="Hangs back and reels heroes in one at a time. Cut the line (one action) and he sulks for a round."),
 dict(n="MILF (Monster I'd Like to Fight)", kind="standard", rar=2, lv=6, order=["cha","con","str"], atk=("Purse swing","Juice-box grenade"),
      d="A suburban mom with a minivan, a yoga-pants budget, and a direct line to your manager.",
      ab=[("Speak to Your Manager","cha","dmg",["Frightened","Stunned"],"")],
      t="Fights from behind the minivan and threatens to call everyone's mother. Hand her a coupon and she leaves a one-star review instead of fighting."),
 # ---- bosses
 dict(n="The Gimp King", kind="boss", rar=3, lv=6, order=["con","str","cha","lck"], atk=("Riding crop","Thrown ball gag"),
      d="Rules a basement kingdom in head-to-toe latex and squeaks when he walks. His safe word is \"Boom,\" and nobody has ever gotten him to say it.",
      ab=[("Tie Them Up","str","dmg",["Stunned","Slowed","Prone"],"Leather, chains, and a surprising amount of knot work."),
          ("Call the Gimps","cha","util",[],"Calls T Bandits (Gimps) out of the closets."),
          ("Latex Hide","con","selftemp",["Blessed"],"")],
      t="Fights in the basement among some very specific furniture. Get him to say his safe word and the fight ends on the spot; he thanks everyone for a lovely evening."),
 dict(n="The Mother Trucker", kind="boss", rar=3, lv=7, order=["str","con","spd","cha"], atk=("Tire iron","Air horn"),
      d="An 18-wheeler with a CB radio and the filthiest mouth on the interstate. Nobody is sure there's a driver.",
      ab=[("Jackknife","str","dmg",["Prone","Stunned","Bleeding"],"Runs down everyone in a line."),
          ("Breaker Breaker","cha","util",[],"Calls T Bandits (Truckers) over the CB."),
          ("Truck Stop","con","selfheal",[],"Refuels on diesel and gas station hot dogs.")],
      t="Fights on the open road and circles back for another pass. Take out the tires and she's just a very loud, very angry building."),
 dict(n="Moby's Dick", kind="boss", rar=4, lv=9, order=["con","str","lck","spd"], atk=("Tail slap","Blowhole spray"),
      d="A white whale with a grudge, a reputation, and a captain who won't stop talking about it. The legends were not exaggerating.",
      ab=[("Breach","str","dmg",["Prone","Stunned","Slowed"],"Leaps out of the water and lands on everyone."),
          ("Blowhole","con","dmg",["Prone","Slowed"],"Hoses down the deck."),
          ("Thick Blubber","con","selftemp",[],"")],
      t="Fights at sea and rams the ship first. A one-legged captain will help the heroes, right up until he wants the kill. Great at Pirate tables, too."),
]
