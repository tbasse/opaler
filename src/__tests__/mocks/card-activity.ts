export const getTableHtml = (acitvityHtml: string | string[]): string => {
  return `<table id="transaction-data"><caption><span>My Opal activity: OpalCard</span></caption><thead><tr><th>Transaction<br/>number</th><th>Date/time</th><th class="narrow center">Mode</th><th>Details</th><th class="narrow center">Journey<br/>number</th><th>Fare Applied</th><th class="right">Fare</th><th class="right amount">Discount</th><th class="right amount">Amount</th>
  </tr></thead><tbody style="opacity: 1;">${
    Array.isArray(acitvityHtml) ? acitvityHtml.join('') : acitvityHtml
  }</tbody></table>`;
};

export const htmlNoActivity =
  '<tr><td>2388</td><td class="no-activity-list">Tue<br>10/07/2018<br>09:43</td></tr>';

export const htmlTopup =
  '<tr><td>2388</td><td class="date-time">Tue<br>10/07/2018<br>09:43</td><td class="center"></td><td lang="en-gb" class="transaction-summary hyphenate">Auto top up - Wynyard</td><td class="center"></td><td></td><td class="right nowrap"></td><td class="right nowrap"></td><td class="right nowrap">$40.00</td></tr>';

export const htmlFareDefault =
  '<tr><td>2718</td><td class="date-time">Tue<br/>30/10/2018<br/>21:16</td><td class="center"><img height="32" alt="train" src="/images/icons/mode-train.png"/></td><td lang="en-gb" class="transaction-summary hyphenate">Convention LR to Central LR</td><td class="center">4</td><td></td><td class="right nowrap">$2.20</td><td class="right nowrap">$0.00</td><td class="right nowrap">-$2.20</td></tr>';

export const htmlFareOffPeak =
  '<tr><td>2726</td><td class="date-time">Thu<br/>01/11/2018<br/>09:36</td><td class="center"><img height="32" alt="train" src="/images/icons/mode-train.png"/></td><td lang="en-gb" class="transaction-summary hyphenate">Green Square to Wynyard</td><td class="center"> 7 </td><td>Off-peak</td><td class="right nowrap">$3.54</td><td class="right nowrap">$1.07</td><td class="right nowrap">-$2.47</td></tr>';

export const htmlFareReward =
  '<tr class="alt"><td>2689</td><td class="date-time">Thu<br>18/10/2018<br>19:10</td><td class="center"><img height="32" alt="train" src="/images/icons/mode-train.png"></td><td lang="en-gb" class="transaction-summary hyphenate">Wynyard to Green Square</td><td class="center"> 9 </td><td>Travel Reward</td><td class="right nowrap">$3.54</td><td class="right nowrap">$2.31</td><td class="right nowrap">-$1.23</td></tr>';

export const htmlFareDayCap =
  '<tr><td>2346</td><td class="date-time">Sun<br>24/06/2018<br>20:11</td><td class="center"><img height="32" alt="train" src="/images/icons/mode-train.png"></td><td lang="en-gb" class="transaction-summary hyphenate">Cir­cu­lar Quay to Green Square</td><td class="center"> 6 </td><td>Day Cap</td><td class="right nowrap">$3.46</td><td class="right nowrap">$3.28</td><td class="right nowrap">-$0.18</td></tr>';

export const htmlNoTapOff =
  '<tr><td>2665</td><td class="date-time">Thu<br>11/10/2018<br>18:24</td><td class="center"><img height="32" alt="bus" src="/images/icons/mode-bus.png"></td><td lang="en-gb" class="transaction-summary hyphenate">Wynyard Sta­tion Stand H to No tap off </td><td class="center"></td><td>Travel Reward</td><td class="right nowrap">$3.66</td><td class="right nowrap">$1.83</td><td class="right nowrap">-$1.83</td></tr>';

export const htmlModeBus =
  '<tr class="alt"><td>2685</td><td class="date-time">Wed<br>17/10/2018<br>21:22</td><td class="center"><img height="32" alt="bus" src="/images/icons/mode-bus.png"></td><td lang="en-gb" class="transaction-summary hyphenate">Princes Hwy at Terry St to Bot­any Rd op Collins St</td><td class="center"> 7 </td><td></td><td class="right nowrap">$3.66</td><td class="right nowrap">$0.00</td><td class="right nowrap">-$3.66</td></tr>';

export const htmlModeFerry =
  '<tr><td>2626</td><td class="date-time">Mon<br>01/10/2018<br>17:25</td><td class="center"><img height="32" alt="ferry" src="/images/icons/mode-ferry.png"></td><td lang="en-gb" class="transaction-summary hyphenate">McMa­hons Point Ferry Wharf to Cir­cu­lar Quay, No. 2 Wharf</td><td class="center"> 2 </td><td></td><td class="right nowrap">$6.01</td><td class="right nowrap">$0.00</td><td class="right nowrap">-$6.01</td></tr>';

export const htmlModeTrain = htmlFareDefault;

export const htmlModeOpalPay =
  '<tr><td>2322</td><td class="date-time">Sat<br>16/06/2018<br>15:19</td><td class="center"><img height="32" alt="pay" src="/images/icons/mode-pay.png"></td><td lang="en-gb" class="transaction-summary hyphenate">Pay - SeaLink - 10655173</td><td class="center"></td><td></td><td class="right nowrap"></td><td class="right nowrap"></td><td class="right nowrap">-$7.50</td></tr>';

export const jsonFareDefault = [
  {
    fare: { applied: null, discount: 0, paid: 220, price: 220 },
    journey: { end: 'Central LR', number: 4, start: 'Convention LR' },
    mode: 'train',
    summary: 'Convention LR to Central LR',
    timestamp: 1540894560,
    transactionNumber: 2718,
  },
];

export const jsonFareOffPeak = [
  {
    fare: { applied: 'Off-peak', discount: 107, paid: 247, price: 354 },
    journey: { end: 'Wynyard', number: 7, start: 'Green Square' },
    mode: 'train',
    summary: 'Green Square to Wynyard',
    timestamp: 1541025360,
    transactionNumber: 2726,
  },
];

export const jsonFareReward = [
  {
    fare: { applied: 'Travel Reward', discount: 231, paid: 123, price: 354 },
    journey: { end: 'Green Square', number: 9, start: 'Wynyard' },
    mode: 'train',
    summary: 'Wynyard to Green Square',
    timestamp: 1539850200,
    transactionNumber: 2689,
  },
];

export const jsonFareDayCap = [
  {
    fare: { applied: 'Day Cap', discount: 328, paid: 18, price: 346 },
    journey: { end: 'Green Square', number: 6, start: 'Circular Quay' },
    mode: 'train',
    summary: 'Circular Quay to Green Square',
    timestamp: 1529835060,
    transactionNumber: 2346,
  },
];

export const jsonNoTapOff = [
  {
    fare: { applied: 'Travel Reward', discount: 183, paid: 183, price: 366 },
    journey: {
      end: 'No tap off ',
      number: NaN,
      start: 'Wynyard Station Stand H',
    },
    mode: 'bus',
    summary: 'Wynyard Station Stand H to No tap off ',
    timestamp: 1539242640,
    transactionNumber: 2665,
  },
];

export const jsonModeBus = [
  {
    fare: { applied: null, discount: 0, paid: 366, price: 366 },
    journey: {
      end: 'Botany Rd op Collins St',
      number: 7,
      start: 'Princes Hwy at Terry St',
    },
    mode: 'bus',
    summary: 'Princes Hwy at Terry St to Botany Rd op Collins St',
    timestamp: 1539771720,
    transactionNumber: 2685,
  },
];

export const jsonModeFerry = [
  {
    fare: { applied: null, discount: 0, paid: 601, price: 601 },
    journey: {
      end: 'Circular Quay, No. 2 Wharf',
      number: 2,
      start: 'McMahons Point Ferry Wharf',
    },
    mode: 'ferry',
    summary: 'McMahons Point Ferry Wharf to Circular Quay, No. 2 Wharf',
    timestamp: 1538378700,
    transactionNumber: 2626,
  },
];

export const jsonModeTrain = [
  {
    fare: { applied: null, discount: 0, paid: 220, price: 220 },
    journey: { end: 'Central LR', number: 4, start: 'Convention LR' },
    mode: 'train',
    summary: 'Convention LR to Central LR',
    timestamp: 1540894560,
    transactionNumber: 2718,
  },
];

export const jsonModeOpalPay = [
  {
    fare: { applied: null, discount: 0, paid: 750, price: 0 },
    journey: null,
    mode: 'pay',
    summary: 'Pay - SeaLink - 10655173',
    timestamp: 1529126340,
    transactionNumber: 2322,
  },
];
