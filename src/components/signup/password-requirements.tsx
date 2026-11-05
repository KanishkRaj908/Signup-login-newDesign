import { CheckCircleIcon, CircleIcon, XCircleIcon } from "@/components/icons";
import { cn } from "@/lib/cn";
import { checkPassword, PASSWORD_RULES } from "@/lib/password";

type Props = {
  password: string;
  /** after a failed submit, unmet rules turn red */
  showErrors: boolean;
  /** hidden everywhere (field not focused, no error) */
  collapsed?: boolean;
  id?: string;
};

/** Live checklist of password rules, shown beside the password field (below it on small screens). */
export function PasswordRequirements({ password, showErrors, collapsed, id }: Props) {
  const results = checkPassword(password);
  return (
    <ul
      id={id}
      aria-label="Password requirements"
      className={cn(
        "m-0 list-none flex flex-col gap-2 p-4 rounded-xl bg-box border border-border-secondary shadow-lg z-2",
        // centred on the input: label (20px) + gap (6px) + half the 44px input = 48px
        "absolute left-[calc(100%+16px)] top-12 -translate-y-1/2 whitespace-nowrap animate-[flFadeIn_.2s_ease_both]",
        // phones: a plain list under the field, no card
        "below-760:static below-760:translate-y-0 below-760:mt-1 below-760:whitespace-normal below-760:p-0 below-760:gap-1.5 below-760:bg-transparent below-760:border-0 below-760:shadow-none below-760:rounded-none",
        // visibility last so it wins the merge over `flex`
        collapsed && "hidden",
      )}
    >
      {PASSWORD_RULES.map((rule) => {
        const met = results[rule.id];
        const failed = !met && showErrors;
        const Icon = met ? CheckCircleIcon : failed ? XCircleIcon : CircleIcon;
        return (
          <li
            key={rule.id}
            className={cn(
              "flex items-center gap-2 text-[13px] leading-5 transition-colors duration-200 [&_svg]:size-3.5 [&_svg]:flex-none",
              met ? "text-success" : failed ? "text-error" : "text-placeholder",
            )}
          >
            <Icon aria-hidden="true" />
            <span>{rule.label}</span>
            <span className="sr-only">{met ? "(met)" : "(not met)"}</span>
          </li>
        );
      })}
    </ul>
  );
}
