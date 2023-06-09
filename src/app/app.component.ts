import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Subscription, timer } from 'rxjs';
import { map } from 'rxjs/operators';
import { Conversion } from 'src/models/conversion';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'test-technique-CACIB';
  taux:number = 1.1;
  montant1:string = "EUR"
  montant2:string = "USD"
  changeForm = new FormGroup({
    tauxEuro: new FormControl(  { value: this.taux, disabled: true}),
    montantEuro: new FormControl('',[Validators.required]),
    montantUsd: new FormControl({ value:0, disabled: true}),
    forcedTaux: new FormControl(0),
  });
  timerSubscription: Subscription; 
  disableFix:boolean=false
  tableauHistorique : Conversion[]=[]


  ngOnInit(): void {
    this.setTimer()
  }

  setTimer(){
        this.timerSubscription = timer(0, 3000).pipe( 
      map(() => { 
        const max =  0.05
        const min =  -0.05        
        this.taux = +(this.taux + Math.random() * (max - min) + min).toFixed(3);        
        this.changeForm.setControl("tauxEuro",new FormControl({ value: this.taux, disabled: true}))
        if(this.changeForm.controls['montantEuro'].value){
          this.calculer()
        }
      }) 
    ).subscribe(); 
  }

  calculer(){
    const eur : number =+this.changeForm.controls['montantEuro'].value!;
    const result :number = +(eur * this.taux).toFixed(3)
    this.changeForm.setControl("montantUsd",new FormControl({ value: result, disabled: true}))

    let conversion: Conversion ={
      tauxReel: +this.changeForm.controls['tauxEuro'].value!,
      valeurInitial:+this.changeForm.controls['montantEuro'].value!,
      valeurFinal:+this.changeForm.controls['montantUsd'].value!,
      deviseInitial:this.montant1,
      deviseFinal:this.montant2,
      tauxSaisi:+this.changeForm.controls['forcedTaux'].value!,
    }
    if(this.tableauHistorique.length >= 5)
      this.tableauHistorique.shift()
      this.tableauHistorique.push(conversion)
  }

  switch(){
    let montant = this.montant1
    this.montant1 = this.montant2
    this.montant2 = montant
    this.taux = 1 / this.taux
  }

  fixTaux(){
    this.timerSubscription.unsubscribe()
    if(!this.check2percent()){
      if(this.changeForm.controls['forcedTaux'].value){
        this.taux = this.changeForm.controls['forcedTaux'].value
        this.changeForm.setControl("tauxEuro",new FormControl({ value: this.taux, disabled: true}))
      }
    }
    else{
      this.disableFix = true
      this.changeForm.setControl("forcedTaux",new FormControl({ value: 0, disabled: true}))
      this.setTimer()
    }
  }

  check2percent():boolean{
    let fixedTaux = +this.changeForm.controls['forcedTaux'].value!
    let variation = ((fixedTaux - this.taux)/this.taux)*100
    return variation > 2 || variation < -2
  }
}
