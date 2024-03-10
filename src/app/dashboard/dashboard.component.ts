import { IPerson } from './../models/IPerson';
import { Component } from '@angular/core';
import { IPayment } from '../models/IPayment';
import {Title} from "@angular/platform-browser";

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent {
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

  constructor(private titleService: Title) {
    titleService.setTitle('Squad\'s Bill Splitter');
  }

  clearEverything(form?: any) {
    this.givenByList = [];
    this.givenToList = [];
    this.settleExpense = [];
    this.ShareDistributionList = [];
    this.totalExpenditure = 0;
    this.perheadExpense = 0;
    this.showCalculation = false;
    if (form != null) form.resetForm();
  }

  trackExpense(expenditure: any) {
    this.clearEverything();
    this.ayas.amountSpent =
      expenditure.ayas === '' || expenditure.ayas === null
        ? 0
        : expenditure.ayas;
    this.shivam.amountSpent =
      expenditure.shivam === '' || expenditure.shivam === null
        ? 0
        : expenditure.shivam;
    this.piyush.amountSpent =
      expenditure.piyush === '' || expenditure.piyush === null
        ? 0
        : expenditure.piyush;
    this.yogank.amountSpent =
      expenditure.yogank === '' || expenditure.yogank === null
        ? 0
        : expenditure.yogank;

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
      Number(this.ayas.amountSpent) +
      Number(this.shivam.amountSpent) +
      Number(this.piyush.amountSpent) +
      Number(this.yogank.amountSpent);
    this.totalExpenditure = Math.ceil(this.totalExpenditure);
    this.perheadExpense = Math.ceil(this.totalExpenditure / 4);
  }

  calculateShare() {
    // debugger
    this.ayas.share = this.ayas.amountSpent - this.perheadExpense;
    this.shivam.share = this.shivam.amountSpent - this.perheadExpense;
    this.piyush.share = this.piyush.amountSpent - this.perheadExpense;
    this.yogank.share = this.yogank.amountSpent - this.perheadExpense;
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

    this.ShareDistributionList = [];

    this.ShareDistributionList.push(this.ayas.share);
    this.ShareDistributionList.push(this.shivam.share);
    this.ShareDistributionList.push(this.piyush.share);
    this.ShareDistributionList.push(this.yogank.share);
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
}
