export async function checkIfUserIsPremium(): Promise<boolean> {
    const logoType: string | null = getLogoType();
    if (logoType === "YOUTUBE_PREMIUM_LOGO") {
        return true;
    }
    return false;
}

function getLogoType(): string | null {
    const masthead = document.querySelector<HTMLElement>('ytd-masthead');
    if (!masthead) {
        console.warn('Element <ytd-masthead> not found.');
        return null;
    }

    return masthead.getAttribute('logo-type');
}
