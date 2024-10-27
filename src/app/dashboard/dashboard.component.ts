import { IPerson } from './../models/IPerson';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { IPayment } from '../models/IPayment';
import { Title } from '@angular/platform-browser';
import html2canvas from 'html2canvas';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent {
  @ViewChild('screenshotTarget', { static: false })
  screenshotTarget!: ElementRef;

  showCalculation: boolean = false;
  givenByList: IPerson[] = [];
  givenToList: IPerson[] = [];
  settleExpense: IPayment[] = [];

  ShareDistributionList: any[] = [];

  ayas: IPerson = { name: 'Ayaskant', amountSpent: 0, share: 0, message: '' };
  shivam: IPerson = { name: 'Shivam', amountSpent: 0, share: 0, message: '' };
  piyush: IPerson = { name: 'Piyush', amountSpent: 0, share: 0, message: '' };
  yogank: IPerson = { name: 'Yogank', amountSpent: 0, share: 0, message: '' };

  totalExpenditure: number = 0;
  perheadExpense: number = 0;
  isYogankIncluded: boolean = false; // Flag to include/exclude Yogank's contribution
  isExclusionPossible: boolean = true; //Flag to exclude yogank only after adding new values
  isSplit: boolean = false; //Flag to ensure share is only visible after split

  constructor(private titleService: Title, private datePipe: DatePipe) {
    titleService.setTitle("Squadify");
  }

  clearEverything(form?: any) {
    this.givenByList = [];
    this.givenToList = [];
    this.settleExpense = [];
    this.ShareDistributionList = [];
    this.totalExpenditure = 0;
    this.perheadExpense = 0;
    this.showCalculation = false;
    this.isExclusionPossible = true;
    this.isSplit = false;
    if (form != null) form.resetForm();
  }

  trackExpense(expenditure: any) {
    this.clearEverything();
    this.isExclusionPossible = false;
    this.isSplit = true;
    this.ayas.amountSpent = expenditure.ayas || 0;
    this.shivam.amountSpent = expenditure.shivam || 0;
    this.piyush.amountSpent = expenditure.piyush || 0;
    this.yogank.amountSpent = this.isYogankIncluded
      ? expenditure.yogank || 0
      : 0;

    this.calculateTotal();
    this.calculateShare();
    this.setDueMessage([this.ayas, this.shivam, this.piyush, this.yogank]);
    let share = [
      this.ayas.amountSpent,
      this.shivam.amountSpent,
      this.piyush.amountSpent,
      this.yogank.amountSpent,
    ];
    this.settleExpense = this.transformShareTable(
      this.givenByList,
      this.givenToList
    );
    this.showCalculation = true;
  }

  calculateTotal() {
    this.totalExpenditure =
      this.ayas.amountSpent +
      this.shivam.amountSpent +
      this.piyush.amountSpent +
      this.yogank.amountSpent;
    this.totalExpenditure = Math.ceil(this.totalExpenditure);
    this.perheadExpense = Math.ceil(
      this.totalExpenditure / (this.isYogankIncluded ? 4 : 3)
    );
  }

  calculateShare() {
    this.ayas.share = this.ayas.amountSpent - this.perheadExpense;
    this.shivam.share = this.shivam.amountSpent - this.perheadExpense;
    this.piyush.share = this.piyush.amountSpent - this.perheadExpense;
    this.yogank.share =
      this.yogank.amountSpent -
      (this.isYogankIncluded ? this.perheadExpense : 0);
  }

  setDueMessage(personList: IPerson[]) {
    personList.forEach((person) => {
      if (person.share === 0) person.message = '';
      else if (person.share < 0) {
        person.message = ': Give';
        this.givenByList.push(person);
      } else {
        person.message = ': Take';
        this.givenToList.push(person);
      }
    });
    this.ayas.message = personList[0].message;
    this.shivam.message = personList[1].message;
    this.piyush.message = personList[2].message;
    this.yogank.message = personList[3].message;

    this.ShareDistributionList = [
      this.ayas.share,
      this.shivam.share,
      this.piyush.share,
      this.yogank.share,
    ];
  }

  transformShareTable(givers: IPerson[], receivers: IPerson[]) {
    let payments: IPayment[] = [];
    givers.sort((a, b) => a.share - b.share);
    receivers.sort((a, b) => b.share - a.share);

    for (let i = 0; i < givers.length; i++) {
      for (let j = 0; j < receivers.length; j++) {
        if (givers[i].share * -1 <= receivers[j].share) {
          let amount = givers[i].share * -1;
          givers[i].share += amount;
          receivers[j].share -= amount;
          payments.push({
            givenBy: givers[i].name,
            givenTo: receivers[j].name,
            amount: amount,
          });
        } else if (givers[i].share * -1 > receivers[j].share) {
          let amount = receivers[j].share;
          givers[i].share += amount;
          receivers[j].share -= amount;
          payments.push({
            givenBy: givers[i].name,
            givenTo: receivers[j].name,
            amount: amount,
          });
        }
      }
    }
    return payments;
  }

  makeYogankOptional() {
    if (this.isExclusionPossible) {
      this.isYogankIncluded = !this.isYogankIncluded;
    }
  }

  // async shareScreenshot() {
  //   try {
  //     // Take a screenshot
  //     const screenshot = await this.takeScreenshot();

  //     // Convert screenshot to data URL
  //     const screenshotDataUrl = await this.convertToDataURL(screenshot);
  //     console.log(screenshotDataUrl);

  //     // Share the screenshot using Web Share API
  //     if (navigator.share) {
  //       navigator
  //         .share({
  //           title: '', // You can provide a title if necessary
  //           url: screenshotDataUrl, // Share the data URL instead of window.location.href
  //         })
  //         .then(() => console.log('Successful share'))
  //         .catch((error) => console.log('Error sharing:', error));
  //     }
  //   } catch (error) {
  //     console.error('Error sharing screenshot:', error);
  //     // Handle the error here, provide user feedback, or fallback mechanism
  //   }
  // }

  async shareScreenshot() {
    let currentDate = this.datePipe.transform(new Date(), 'dd_MM_yy');
    try {
      // Take a screenshot of the page
      const canvas = await html2canvas(document.body);

      // Convert the screenshot to a Blob
      canvas.toBlob(async (blob) => {
        if (blob) {
          // Share the Blob using Web Share API
          if (navigator.share) {
            await navigator.share({
              title: undefined,
              files: [new File([blob], `${currentDate}_Split.png`, { type: 'image/png' })],
            });
          } else {
            console.log('Web Share API not supported.');
          }
        } else {
          console.error('Unable to create Blob from screenshot.');
        }
      }, 'image/png');
    } catch (error) {
      console.error('Error capturing or sharing screenshot:', error);
    }
  }


  async takeScreenshot(): Promise<Blob> {
    const targetElement = this.screenshotTarget.nativeElement;

    try {
      // Use html2canvas to capture the screenshot
      const canvas = await html2canvas(targetElement, {
        useCORS: true, // Enable CORS support if necessary
        logging: false, // Disable logging to console
      });

      // Convert canvas to Blob
      return new Promise((resolve, reject) => {
        canvas.toBlob((blob: Blob | null) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to convert canvas to blob.'));
          }
        });
      });
    } catch (error) {
      console.error('Error capturing screenshot:', error);
      throw error; // Rethrow the error for further handling
    }
  }

  async convertToDataURL(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
}

//Old Version Code:
// export class DashboardComponent {
//   showCalculation: boolean = false;
//   givenByList: IPerson[] = [];
//   givenToList: IPerson[] = [];
//   settleExpense: IPayment[] = [];

//   ShareDistributionList: any[] = [];

//   ayas: IPerson = { name: 'Ayaskant', amountSpent: 0, share: 0, message: '' };
//   shivam: IPerson = { name: 'Shivam', amountSpent: 0, share: 0, message: '' };
//   piyush: IPerson = { name: 'Piyush', amountSpent: 0, share: 0, message: '' };
//   yogank: IPerson = { name: 'Yogank', amountSpent: 0, share: 0, message: '' };

//   totalExpenditure: number = 0;
//   perheadExpense: number = 0;
//   isOptional: boolean = false;

//   constructor(private titleService: Title) {
//     titleService.setTitle('Squad\'s Bill Splitter');
//   }

//   clearEverything(form?: any) {
//     this.givenByList = [];
//     this.givenToList = [];
//     this.settleExpense = [];
//     this.ShareDistributionList = [];
//     this.totalExpenditure = 0;
//     this.perheadExpense = 0;
//     this.showCalculation = false;
//     if (form != null) form.resetForm();
//   }

//   trackExpense(expenditure: any) {
//     this.clearEverything();
//     this.ayas.amountSpent =
//       expenditure.ayas === '' || expenditure.ayas === null
//         ? 0
//         : expenditure.ayas;
//     this.shivam.amountSpent =
//       expenditure.shivam === '' || expenditure.shivam === null
//         ? 0
//         : expenditure.shivam;
//     this.piyush.amountSpent =
//       expenditure.piyush === '' || expenditure.piyush === null
//         ? 0
//         : expenditure.piyush;
//     this.yogank.amountSpent =
//       expenditure.yogank === '' || expenditure.yogank === null
//         ? 0
//         : expenditure.yogank;

//     this.calculateTotal();
//     this.calculateShare();
//     this.setDueMessage([this.ayas, this.shivam, this.piyush, this.yogank]);
//     let share = [
//       this.ayas.amountSpent,
//       this.shivam.amountSpent,
//       this.piyush.amountSpent,
//       this.yogank.amountSpent,
//     ];
//     this.settleExpense = this.transformShareTable(
//       this.givenByList,
//       this.givenToList
//     );
//     this.showCalculation = true;
//   }

//   calculateTotal() {
//     this.totalExpenditure =
//       Number(this.ayas.amountSpent) +
//       Number(this.shivam.amountSpent) +
//       Number(this.piyush.amountSpent) +
//       Number(this.yogank.amountSpent);
//     this.totalExpenditure = Math.ceil(this.totalExpenditure);
//     this.perheadExpense = Math.ceil(this.totalExpenditure / 4);
//   }

//   calculateShare() {
//     // debugger
//     this.ayas.share = this.ayas.amountSpent - this.perheadExpense;
//     this.shivam.share = this.shivam.amountSpent - this.perheadExpense;
//     this.piyush.share = this.piyush.amountSpent - this.perheadExpense;
//     this.yogank.share = this.yogank.amountSpent - this.perheadExpense;
//   }

//   setDueMessage(personList: IPerson[]) {
//     personList.forEach((person) => {
//       if (person.share === 0) person.message = '';
//       else if (person.share < 0) {
//         person.message = ': Give';
//         this.givenByList.push(person);
//       } else {
//         person.message = ': Take';
//         this.givenToList.push(person);
//       }
//     });
//     this.ayas.message = personList[0].message;
//     this.shivam.message = personList[1].message;
//     this.piyush.message = personList[2].message;
//     this.yogank.message = personList[3].message;

//     this.ShareDistributionList = [];

//     this.ShareDistributionList.push(this.ayas.share);
//     this.ShareDistributionList.push(this.shivam.share);
//     this.ShareDistributionList.push(this.piyush.share);
//     this.ShareDistributionList.push(this.yogank.share);
//   }

//   transformShareTable(givers: IPerson[], receivers: IPerson[]) {
//     let payments: IPayment[] = [];
//     givers.sort((a, b) => a.share - b.share);
//     receivers.sort((a, b) => b.share - a.share);

//     for (let i = 0; i < givers.length; i++) {
//       for (let j = 0; j < receivers.length; j++) {
//         if (givers[i].share * -1 <= receivers[j].share) {
//           let amount = givers[i].share * -1;
//           givers[i].share += amount;
//           receivers[j].share -= amount;
//           payments.push({
//             givenBy: givers[i].name,
//             givenTo: receivers[j].name,
//             amount: amount,
//           });
//         } else if (givers[i].share * -1 > receivers[j].share) {
//           let amount = receivers[j].share;
//           givers[i].share += amount;
//           receivers[j].share -= amount;
//           payments.push({
//             givenBy: givers[i].name,
//             givenTo: receivers[j].name,
//             amount: amount,
//           });
//         }
//       }
//     }
//     return payments;
//   }
// }
