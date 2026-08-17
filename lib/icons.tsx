import React from "react";
import {
  Flame,
  Coins,
  Cpu,
  ShoppingBag,
  Compass,
  Info,
  Sparkles,
  Shield,
  UserCheck,
  Terminal,
  UserPlus,
  AlertCircle,
  FileText,
  Gamepad2,
  Crown,
  Star,
  HelpCircle,
  Clock,
  CreditCard,
  Swords,
  Package,
  Hand,
  User,
  Clover,
  Dice5,
  RefreshCw,
  DollarSign,
  ShoppingCart,
  Cloud,
  MessageSquare,
  Target,
  ShieldAlert,
  Sliders,
  Users,
  Bomb,
  Mail,
  AtSign,
  Music,
  Gift,
  MapPin,
  CheckSquare,
  Trophy,
  Award,
  Scale,
  Volume2,
  Server,
  BarChart3,
  Moon,
  Lock,
  Scroll,
  GitCommit,
  Layers,
  GitPullRequest,
  BookOpen,
} from "lucide-react";

export type ColorVariant = "orange" | "yellow" | "purple" | "teal" | "blue" | "green" | "red";

/**
 * Returns a dynamic color accent variant for a given doc route
 */
export function getDocColorVariant(slug: string, title: string): ColorVariant {
  const s = (slug || "").toLowerCase();
  const t = (title || "").toLowerCase();

  if (s.includes("vip") || t.includes("vip") || s.includes("gold") || s.includes("mythic") || s.includes("immortal")) return "yellow";
  if (s.includes("staff") || s.includes("admin") || s.includes("regulament") || s.includes("comenzi")) return "blue";
  if (s.includes("currency") || s.includes("credits") || s.includes("coin") || s.includes("shop")) return "green";
  if (s.includes("gambling") || s.includes("roulette") || s.includes("dice") || s.includes("slot")) return "purple";
  if (s.includes("skins") || s.includes("knives") || s.includes("gloves") || s.includes("cases")) return "red";
  if (s.includes("hub") || s.includes("changelog") || s.includes("contribute")) return "teal";

  return "orange";
}

/**
 * Returns a dedicated Lucide icon component based on route slug and title
 */
export function getDocIcon(slug: string, title: string, size: number = 14): React.ReactNode {
  const s = (slug || "").toLowerCase();
  const t = (title || "").toLowerCase();

  // Informatii & General
  if (s.includes("staff/comenzi") || t.includes("comenzi staff")) return <Terminal size={size} aria-hidden="true" />;
  if (s.includes("staff/cum-aplici") || t.includes("cum sa aplici") || t.includes("cum sa intri")) return <UserPlus size={size} aria-hidden="true" />;
  if (s.includes("staff/motive") || t.includes("motive oficiale")) return <AlertCircle size={size} aria-hidden="true" />;
  if (s.includes("staff")) return <Shield size={size} aria-hidden="true" />;

  if (s.includes("regulament-go") || s.includes("regulamente/go/regulament-go") || t === "regulament jucatori") return <Gamepad2 size={size} aria-hidden="true" />;
  if (s.includes("regulament-staff") || t === "regulament staff") return <Shield size={size} aria-hidden="true" />;
  if (s.includes("regulament-vip") || t === "regulament vip") return <Crown size={size} aria-hidden="true" />;
  if (s.includes("regulament") || s.includes("regulamente")) return <FileText size={size} aria-hidden="true" />;

  if (s.includes("about") || t.includes("despre")) return <Star size={size} aria-hidden="true" />;
  if (s.includes("faq") || t.includes("intrebari") || t.includes("faq")) return <HelpCircle size={size} aria-hidden="true" />;
  if (s.includes("patch-notes") || t.includes("patch notes")) return <Clock size={size} aria-hidden="true" />;
  if (s.includes("getting-started") || t.includes("incepe") || t.includes("getting started")) return <Flame size={size} aria-hidden="true" />;

  // Currency
  if (s.includes("phoenixcoins") || t.includes("phoenix coins")) return <Flame size={size} aria-hidden="true" />;
  if (s.includes("credits") || t.includes("credits") || t.includes("credite")) return <CreditCard size={size} aria-hidden="true" />;
  if (s === "currency" || t === "currency") return <Coins size={size} aria-hidden="true" />;

  // Weapon Skins
  if (s.includes("skins/informatiiws") || t.includes("sistemul de weaponskins")) return <Swords size={size} aria-hidden="true" />;
  if (s.includes("skins/cases") || t.includes("cases") || t.includes("cutii")) return <Package size={size} aria-hidden="true" />;
  if (s.includes("skins/gloves") || t.includes("gloves") || t.includes("manusi")) return <Hand size={size} aria-hidden="true" />;
  if (s.includes("skins/agents") || t.includes("agents") || t.includes("agenti")) return <User size={size} aria-hidden="true" />;
  if (s.includes("skins/knives") || t.includes("knives") || t.includes("cutite")) return <Sparkles size={size} aria-hidden="true" />;
  if (s.includes("skins") || t.includes("weapon skins")) return <Swords size={size} aria-hidden="true" />;

  // Gambling
  if (s.includes("gambling/roulette") || t.includes("roulette") || t.includes("ruleta")) return <RefreshCw size={size} aria-hidden="true" />;
  if (s.includes("gambling/slots") || t.includes("slots") || t.includes("aparate")) return <DollarSign size={size} aria-hidden="true" />;
  if (s.includes("gambling/dices") || t.includes("dices") || t.includes("barbut")) return <Dice5 size={size} aria-hidden="true" />;
  if (s.includes("gambling") || t.includes("gambling")) return <Clover size={size} aria-hidden="true" />;

  // In-Game Shop
  if (s.includes("shop/tracers") || t.includes("weapon tracers")) return <Flame size={size} aria-hidden="true" />;
  if (s.includes("shop/color-smokes") || t.includes("color smokes")) return <Cloud size={size} aria-hidden="true" />;
  if (s.includes("shop/chat-tags") || t.includes("chat") || t.includes("tag")) return <MessageSquare size={size} aria-hidden="true" />;
  if (s.includes("shop") || t.includes("in-game shop")) return <ShoppingCart size={size} aria-hidden="true" />;

  // Other Systems
  if (s.includes("hit-effect") || t.includes("hit effect")) return <Target size={size} aria-hidden="true" />;
  if (s.includes("anti-rush") || t.includes("anti rush")) return <ShieldAlert size={size} aria-hidden="true" />;
  if (s.includes("settings") || t.includes("client settings")) return <Sliders size={size} aria-hidden="true" />;
  if (s.includes("hide-teammates") || t.includes("hide teammates")) return <Users size={size} aria-hidden="true" />;
  if (s.includes("c4-planter") || t.includes("c4 planter")) return <Bomb size={size} aria-hidden="true" />;
  if (s.includes("private-messages") || t.includes("private messages")) return <Mail size={size} aria-hidden="true" />;
  if (s.includes("mention-system") || t.includes("mention")) return <AtSign size={size} aria-hidden="true" />;
  if (s.includes("mvp-rewards") || t.includes("mvp rewards")) return <Gift size={size} aria-hidden="true" />;
  if (s.includes("mvp") || t.includes("mvp")) return <Music size={size} aria-hidden="true" />;
  if (s.includes("gold-member") || t.includes("gold member")) return <Crown size={size} aria-hidden="true" />;
  if (s.includes("map-chooser") || t.includes("map chooser") || t.includes("rtv")) return <MapPin size={size} aria-hidden="true" />;
  if (s.includes("missions") || t.includes("missions")) return <CheckSquare size={size} aria-hidden="true" />;
  if (s.includes("ranks") || s.includes("rank-phases") || t.includes("rank")) return <Trophy size={size} aria-hidden="true" />;
  if (s.includes("faceit-badge") || t.includes("faceit")) return <Award size={size} aria-hidden="true" />;
  if (s.includes("teambalance") || t.includes("team balance")) return <Scale size={size} aria-hidden="true" />;
  if (s === "systems" || t === "systems" || t === "other systems") return <Cpu size={size} aria-hidden="true" />;

  // Market & Donatii
  if (s.includes("entry-songs") || t.includes("entry songs")) return <Volume2 size={size} aria-hidden="true" />;
  if (s.includes("sanks") || t.includes("sank sounds")) return <Volume2 size={size} aria-hidden="true" />;
  if (s.includes("server-slots") || t.includes("server slots")) return <Server size={size} aria-hidden="true" />;
  if (s.includes("premium-shop") || t.includes("premium shop")) return <Sparkles size={size} aria-hidden="true" />;

  // VIP
  if (s.includes("vip-overview") || t.includes("comparatie vip") || t.includes("vip overview")) return <BarChart3 size={size} aria-hidden="true" />;
  if (s.includes("vip-night") || t.includes("vip night")) return <Moon size={size} aria-hidden="true" />;
  if (s.includes("vip-test") || t.includes("vip test")) return <Sparkles size={size} aria-hidden="true" />;
  if (s.includes("rebirth") || s.includes("immortal") || s.includes("mythic") || s.includes("vip")) return <Crown size={size} aria-hidden="true" />;
  if (s === "market" || t.includes("market")) return <ShoppingBag size={size} aria-hidden="true" />;

  // Hub & About
  if (s.includes("privacy") || t.includes("privacy")) return <Lock size={size} aria-hidden="true" />;
  if (s.includes("terms") || t.includes("terms")) return <Scroll size={size} aria-hidden="true" />;
  if (s.includes("changelogs") || s.includes("changelog")) return <GitCommit size={size} aria-hidden="true" />;
  if (s.includes("contribute") || t.includes("contribuie")) return <GitPullRequest size={size} aria-hidden="true" />;
  if (s.includes("versions") || t.includes("versiuni")) return <Layers size={size} aria-hidden="true" />;
  if (s.includes("hub") || t.includes("hub")) return <Compass size={size} aria-hidden="true" />;

  return <FileText size={size} aria-hidden="true" />;
}

/**
 * Returns an icon for a top-level category name
 */
export function getCategoryIcon(category: string, size: number = 13): React.ReactNode {
  const c = (category || "").toLowerCase();

  if (c.includes("informații") || c.includes("informatii")) return <Flame size={size} aria-hidden="true" />;
  if (c.includes("currency")) return <Coins size={size} aria-hidden="true" />;
  if (c.includes("systems")) return <Cpu size={size} aria-hidden="true" />;
  if (c.includes("market") || c.includes("donații") || c.includes("donatii")) return <ShoppingBag size={size} aria-hidden="true" />;
  if (c.includes("hub") || c.includes("resurse")) return <Compass size={size} aria-hidden="true" />;
  if (c.includes("despre") || c.includes("about")) return <Info size={size} aria-hidden="true" />;
  if (c.includes("wiki") || c.includes("actualizări")) return <Sparkles size={size} aria-hidden="true" />;

  return <BookOpen size={size} aria-hidden="true" />;
}
