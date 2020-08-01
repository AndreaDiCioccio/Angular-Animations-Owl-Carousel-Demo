import { Component } from '@angular/core';
import { state, style, transition, animate, trigger } from '@angular/animations';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
    animations:[
        // carousel move
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
                animate('{{time}}')
            ),
            transition('* => left',
                animate('{{time}}')
            ),
            transition('* => start',
                animate('{{time}}')
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
    buttonsHiddenTimeOut

    ngOnInit(){

        this.initObjectList()
        this.initVariables()
        this.setItemsStartPosition()
    
    }

    initVariables(){

        this.elementLeftShift = 225
        this.totalElementsCount = this.carouselItems.length
       
        this.elementWidth = this.carouselItems[0].offsetWidth
        this.marginBetweenElements = this.elementLeftShift - this.elementWidth
        this.carouselWidth = ((this.elementWidth + this.marginBetweenElements) * this.totalElementsCount) - this.marginBetweenElements
        this.carousel.style.width = this.carouselWidth + 'px'
        this.windowWidth = document.body.offsetWidth
        
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

    nextItems(){
        
        let carouselXPosition
        let animationTime
        let done:boolean = false
        let elementXPosition
        let stripShift

        this.calculateExcess()
        
        // se l' eccesso a destra è più lungo della larghezza della finestra
        if(this.carouselStripExceededRight > this.windowWidth){

            //this.calculateExcess()

            this.carouselItems.forEach( element => {
                
                elementXPosition = element.getBoundingClientRect().left
                
                //se parte dell'elemento si trova sulla linea destra della finestra E l'eccesso a destra è maggiore della larghezza di un elemento
                if(elementXPosition + this.elementWidth > this.windowWidth && this.carouselStripExceededRight > this.elementWidth){
                
                    if(!done){
                        carouselXPosition = this.carousel.offsetLeft - elementXPosition
                        this.carouselXPosition = carouselXPosition + 'px'
                        stripShift = animationTime = elementXPosition
                        done = true
                    }
                    
                }

            })

            this.carouselStripExceededRight -= stripShift
            this.carouselStripExceededLeft += stripShift

        //se l'eccesso a destra è minore della larghezza della finestra E se ci sono ancora items a destra da scrollare 
        }else if( this.carouselStripExceededRight > 0 && this.carouselStripExceededRight < this.windowWidth){

            let selectedElement:HTMLElement
            let done:boolean

            this.carouselItems.forEach( element =>{
                if(!done && element.getBoundingClientRect().left + this.elementWidth > this.windowWidth){
                    selectedElement = element
                    done = true
                }
            })

            //se ciò che rimane da scrollare è maggiore della larghezza della finestra
            if( (this.carouselStripExceededRight + (this.windowWidth - selectedElement.getBoundingClientRect().left) ) > this.windowWidth){

                elementXPosition = selectedElement.getBoundingClientRect().left
                carouselXPosition = this.carousel.offsetLeft - elementXPosition
                this.carouselXPosition = carouselXPosition + 'px'
                //this.calculateExcess()
                stripShift = animationTime = elementXPosition

            }else{

                carouselXPosition -= this.carouselStripExceededRight
                stripShift = animationTime = this.carouselStripExceededRight
                            
                this.carouselXPosition = this.carousel.offsetLeft - this.carouselStripExceededRight + 'px'
            
            }

            this.carouselStripExceededRight -= stripShift
            this.carouselStripExceededLeft += stripShift

        }
        
        if(animationTime){
            this.disableButtons()
            this.animationTime = animationTime * this.animationTimeMultiplier + 'ms'
            this.carouselScrollState = 'right'
        }

    }

    prevItems(){

        let carouselXPosition:number
        let animationTime
        let elementXPosition
        let selectedElement:HTMLElement
        let carouselShift

        this.calculateExcess()

        //se l'eccesso a sinistra è minore della larghezza della finestra e maggiore di 0
        if( this.carouselStripExceededLeft < this.windowWidth && this.carouselStripExceededLeft > 0){

            console.log('if')
            console.log('exceededLeft', this.carouselStripExceededLeft)
            console.log('eindowWidth', this.windowWidth)

            //this.calculateExcess()

            this.carouselItems.forEach( element => {
                    if(element.getBoundingClientRect().left < 0 ){
                        selectedElement = element
                    }
            })

            let selectedElementWidth:number = selectedElement.getBoundingClientRect().width 

            console.log('selectedElement', selectedElement)

            //se un elemento si trova a cavallo del bordo sinistro della finestra E se l'elemento si trova nascosto a sinistra della finestra
            if(selectedElement.getBoundingClientRect().left + selectedElementWidth > 0 && selectedElement.offsetLeft > 0){

                console.log('innerIf')

                carouselXPosition = this.carousel.getBoundingClientRect().left + Math.abs(selectedElement.offsetLeft)
                this.carouselXPosition = carouselXPosition + 'px'
                carouselShift = Math.abs(selectedElement.offsetLeft)
                animationTime = carouselShift

            }else if(selectedElement.offsetLeft == 0){

                console.log('innerElse')

                this.carouselXPosition = 0 + 'px'
                animationTime = Math.abs(selectedElement.getBoundingClientRect().left)

            }
/* 
            stripExcedeedLeft = Math.abs(this.carousel.getBoundingClientRect().left)
            carouselXPosition += stripExcedeedLeft
            animationTime = stripExcedeedLeft
                        
            this.carouselXPosition = 0 + 'px'

            this.carouselStripExceededRight = this.carouselWidth - this.windowWidth
            this.carouselStripExceededLeft = 0
 */
        //se l'eccesso a sinistra è maggiore della larghezza della finestra
        }else if(this.carouselStripExceededLeft > this.windowWidth){

            console.log('else')

            this.carouselItems.forEach( element => {
                
                elementXPosition = element.getBoundingClientRect().left
                
                if( elementXPosition < 0){
                    selectedElement = element
                }

            })

            carouselXPosition = this.carousel.getBoundingClientRect().left + 
                (this.windowWidth - (this.elementWidth - Math.abs(selectedElement.getBoundingClientRect().left)))
            carouselShift = this.windowWidth - (this.elementWidth - Math.abs(selectedElement.getBoundingClientRect().left))
            animationTime = carouselShift
            this.carouselXPosition = carouselXPosition + 'px'

            //this.calculateExcess()

            this.carouselStripExceededRight += carouselShift
            this.carouselStripExceededLeft -= carouselShift

        }

        if(animationTime){

            this.disableButtons()
            this.animationTime = animationTime * this.animationTimeMultiplier + 'ms'
            this.carouselScrollState = 'left'
        
        }

    }

    calculateExcess(){

        this.carouselStripExceededRight = this.carouselWidth - Math.abs(this.carousel.getBoundingClientRect().left) - this.windowWidth
        this.carouselStripExceededLeft = Math.abs(this.carousel.getBoundingClientRect().left)

    }

    pause(){

        if(this.carouselScrollState != 'pause'){
            this.carouselScrollState = 'pause'
        }

        this.enableButtons()

    }

    onResize(){

        
        let carouselLeft:number = this.carousel.offsetLeft
        let newWindowWidth:number = document.body.offsetWidth
        let carouselXPosition:number = carouselLeft + 
        (newWindowWidth - (this.carouselWidth - this.carouselStripExceededRight - this.carouselStripExceededLeft))

        if(this.carouselStripExceededLeft > 0){
            
            if( newWindowWidth > this.windowWidth){
                this.carousel.style.left = carouselXPosition + 'px'
                this.carouselStripExceededLeft = this.carouselWidth - newWindowWidth - this.carouselStripExceededRight
            }

            this.animationTime = Math.abs(this.carouselStripExceededLeft * this.animationTimeMultiplier) + 'ms'

            this.initObjectList()
            this.initVariables()

            this.carouselScrollState = 'start'

        }else{

            this.initObjectList()
            this.initVariables()
        
        }

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
