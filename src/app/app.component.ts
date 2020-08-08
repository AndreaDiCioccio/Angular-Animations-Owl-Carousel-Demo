import { Component } from '@angular/core';
import { state, style, transition, animate, trigger } from '@angular/animations';
import { faArrowAltCircleLeft, faArrowAltCircleRight } from '@fortawesome/free-solid-svg-icons'
@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
    animations:[
        // carousel scroll
        trigger('scroll',[
            state('start', 
                style({
                    left:'0px'
                })
            ),
            state('pause', style({})),
            state('right', 
                style({
                    left:'{{leftPosition}}'
                }), {params: {leftPosition: 0}}
            ),
            state('left', 
                style({
                    left:'{{leftPosition}}'
                }), {params: {leftPosition: 0}}
            ),
        
            transition('* => right',
                animate('{{time}} cubic-bezier(0.25, 1, 0.5, 1)')
            ),
            transition('* => left',
                animate('{{time}} cubic-bezier(0.25, 1, 0.5, 1)')
            ),
            transition('* => start',
                animate('{{time}} cubic-bezier(0.25, 1, 0.5, 1)')
            )
        ]),
        //buttons fade
        trigger('buttonsFade',[
            state('hidden', 
                style({
                    opacity:'0'
                })
            ),
            state('visible', 
                style({
                    opacity:'0.4'
                })
            ),
        
            transition('hidden => visible',
                animate('1000ms')
            ),
            transition('visible => hidden',
                animate('1000ms')
            )
            
        ])
    ]
})

export class AppComponent {

    leftArrowIcon = faArrowAltCircleLeft
    rightArrowIcon = faArrowAltCircleRight
  
    windowWidth:number
    elementLeftShift:number
    marginBetweenElements:number
    elementWidth:number
    carouselWidth:number
    carouselStripExceededRight:number
    carouselStripExceededLeft:number
    totalElementsCount:number
    carouselXPosition:string
    buttonsFadeState:string = 'hidden'
    carouselScrollState:string = 'start'
    animationTime:string = '1ms'
    animationTimeMultiplier:number = 2

    carousel:HTMLElement
    carouselItems:NodeListOf<HTMLElement>

    buttonDisabled:boolean
    buttonsHiddenTimeOut:number //setTimeout

    ngOnInit(){

        this.initObjectList()
        this.initVariables()
        this.setItemsStartPosition()
    
    }

    initVariables(){

        this.elementLeftShift = 215
        this.totalElementsCount = this.carouselItems.length
       
        this.elementWidth = this.carouselItems[0].getBoundingClientRect().width
        this.marginBetweenElements = this.elementLeftShift - this.elementWidth
        this.carouselWidth = ((this.elementWidth + this.marginBetweenElements) * this.totalElementsCount) - this.marginBetweenElements
        this.carousel.style.width = this.carouselWidth + 'px'
        this.windowWidth = document.body.getBoundingClientRect().width
        
        this.carouselStripExceededRight = this.carouselWidth - this.windowWidth
        this.carouselStripExceededLeft = 0

    }

    initObjectList(){

        this.carousel = document.querySelector("div.carousel")
        this.carouselItems = this.carousel.querySelectorAll('.item-carousel')
    
    }

    setItemsStartPosition(){

        let totalShift:number = 0

        this.carouselItems.forEach( (element, index) => {
            if(index != 0){
                element.style.left = totalShift + this.elementLeftShift + 'px'
                totalShift += this.elementLeftShift
            }else{
                element.style.left = totalShift + 'px'
            }
        })

    }

    // scroll right
    nextItems(){
        
        let carouselXPosition:number
        let carouselLeft:number = this.carousel.offsetLeft
        let stripShift:number
        let animationTime:number

        this.calculateExcess()

        //se l'eccesso a destra è minore della larghezza della finestra E se ci sono ancora elementi a destra da visualizzare
        if(this.carouselStripExceededRight < this.windowWidth && this.carouselStripExceededRight > 0){

            console.log('if')

            carouselXPosition = carouselLeft - this.carouselStripExceededRight
            stripShift = this.carouselStripExceededRight
            animationTime = stripShift
                        
            this.carouselXPosition = carouselXPosition + 'px'

        //se l'eccesso a destra è maggiore della lunghezza della finestra
        }else if(this.carouselStripExceededRight > this.windowWidth){

            let done:boolean = false

            this.carouselItems.forEach( element => {
                
                let elementXPosition:number = element.getBoundingClientRect().left
                let elementWidth:number = element.getBoundingClientRect().width
                
                //se parte dell'elemento si trova sulla linea destra della finestra E l'eccesso a destra è maggiore della larghezza di un elemento
                if(elementXPosition + elementWidth > this.windowWidth && this.carouselStripExceededRight > this.elementWidth){

                    if(!done){

                        carouselXPosition = carouselLeft - elementXPosition
                        this.carouselXPosition = carouselXPosition + 'px'
                        stripShift = elementXPosition 
                        animationTime = stripShift
                        done = true

                    }
                    
                }

            })

        }

        if(animationTime){
            this.disableButtons()
            this.animationTime = animationTime * this.animationTimeMultiplier + 'ms'
            this.carouselScrollState = 'right'
        }


    }

    // scroll left
    prevItems(){

        let animationTime:number

        this.calculateExcess()

        // se l'eccesso a sinistra è minore della lunghezza della finestra E maggiore di 0
        if(this.carouselStripExceededLeft < this.windowWidth && this.carouselStripExceededLeft > 0){

            let carouselShift:number

            this.carouselXPosition = 0 + 'px'
            carouselShift = this.carouselStripExceededLeft
            animationTime = carouselShift 

        // se l'eccesso a sinistra è maggiore della lunghezza della finestra
        }else if(this.carouselStripExceededLeft > this.windowWidth){

            let selectedElement:HTMLElement
            let carouselShift:number
            let carouselXPosition:number = this.carousel.getBoundingClientRect().left

            this.carouselItems.forEach( element => {
                
                let elementXPosition:number = element.getBoundingClientRect().left
                
                if( elementXPosition < 0){
                    selectedElement = element
                }

            })

            carouselXPosition = this.carousel.getBoundingClientRect().left + 
                (this.windowWidth - (this.elementWidth - Math.abs(selectedElement.getBoundingClientRect().left)))
            carouselShift = this.windowWidth - (this.elementWidth - Math.abs(selectedElement.getBoundingClientRect().left))
            animationTime = carouselShift
            this.carouselXPosition = carouselXPosition + 'px'

        }

        if(animationTime){

            this.disableButtons()
            this.animationTime = animationTime * this.animationTimeMultiplier + 'ms'
            this.carouselScrollState = 'left'
        
        }

    }

    pause(){

        if(this.carouselScrollState != 'pause'){
            this.carouselScrollState = 'pause'
        }

        this.enableButtons()

    }

    onResize(){

        this.calculateExcess()
        
        let newWindowWidth:number = document.body.getBoundingClientRect().width
        let carouselLeft:number = this.carousel.offsetLeft
        let carouselXPosition = this.carousel.getBoundingClientRect().left

        if(this.carouselStripExceededLeft > 0){

            //se si ingrandisce la finestra
            if( newWindowWidth > this.windowWidth){

                if(this.carouselStripExceededRight < 0)
                    this.carousel.style.left = carouselLeft + Math.abs(this.carouselStripExceededRight) + 'px'
                
            }

            this.animationTime = Math.abs(this.carouselStripExceededLeft * this.animationTimeMultiplier) + 'ms'

            this.initObjectList()
            this.initVariables()

        }else{

            this.initObjectList()
            this.initVariables()
        
        }

    }

    // calcola l'eccesso destro e sinistro del div del carousel fuori dalla finestra
    calculateExcess(){

        let windowWidth:number = document.body.offsetWidth

        this.carouselStripExceededRight = this.carouselWidth + this.carousel.getBoundingClientRect().left - windowWidth
        this.carouselStripExceededLeft = Math.abs(this.carousel.getBoundingClientRect().left)

    }

    disableButtons(){

        this.buttonDisabled = true

    }

    enableButtons(){

        this.buttonDisabled = false
    
    }

    showButtons(){

        this.buttonsFadeState = 'visible'

        if(this.buttonsHiddenTimeOut)
            window.clearTimeout(this.buttonsHiddenTimeOut)

        let buttons:NodeListOf<HTMLElement> = document.querySelectorAll('.button-slide')

        buttons.forEach( button => {
            button.style.visibility = 'visible'
        })
        
    }

    hideButtons(){

        this.buttonsFadeState = 'hidden'

        let buttons:NodeListOf<HTMLElement> = document.querySelectorAll('.button-slide')

        this.buttonsHiddenTimeOut = setTimeout(() => {
            buttons.forEach( button => {
                button.style.visibility = 'hidden'
            })
        }, 1500);

    }

}
