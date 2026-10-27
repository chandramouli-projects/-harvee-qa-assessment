// Static test data. Credentials and the base URL are NOT here - they come from utils/environment.ts.

export const PRODUCTS = {
  backpack: 'Sauce Labs Backpack',
  bikeLight: 'Sauce Labs Bike Light',
  boltTShirt: 'Sauce Labs Bolt T-Shirt',
  fleeceJacket: 'Sauce Labs Fleece Jacket',
  onesie: 'Sauce Labs Onesie',
  redTShirt: 'Test.allTheThings() T-Shirt (Red)',
} as const;

export type ProductName = (typeof PRODUCTS)[keyof typeof PRODUCTS];

export interface Customer {
  firstName: string;
  lastName: string;
  postalCode: string;
}

export const CUSTOMER: Customer = {
  firstName: 'Test',
  lastName: 'Customer',
  postalCode: '12345',
};

export const INVALID_PASSWORD = 'not_the_demo_password';
export const UNKNOWN_USERNAME = 'unknown_user';

export const MESSAGES = {
  lockedOut: 'Epic sadface: Sorry, this user has been locked out.',
  usernameRequired: 'Epic sadface: Username is required',
  passwordRequired: 'Epic sadface: Password is required',
  invalidCredentials: 'Epic sadface: Username and password do not match any user in this service',
  protectedPage: (pagePath: string) =>
    `Epic sadface: You can only access '${pagePath}' when you are logged in.`,
  firstNameRequired: 'Error: First Name is required',
  lastNameRequired: 'Error: Last Name is required',
  postalCodeRequired: 'Error: Postal Code is required',
  orderComplete: 'Thank you for your order!',
} as const;

export type SortOption = 'az' | 'za' | 'lohi' | 'hilo';

export const SORT_LABELS: Record<SortOption, string> = {
  az: 'Name (A to Z)',
  za: 'Name (Z to A)',
  lohi: 'Price (low to high)',
  hilo: 'Price (high to low)',
};

export const VIEWPORTS = {
  desktop: { width: 1366, height: 768 },
  mobile: { width: 375, height: 667 },
} as const;
